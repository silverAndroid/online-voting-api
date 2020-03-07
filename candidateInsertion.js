const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

require('dotenv').load();
const { db, IsolationLevel } = require('./db');

async function main() {
    console.log('Resetting candidate tables');
    await db.query('DELETE FROM candidates;');
    await db.query('DELETE FROM positions;');

    console.log('Inserting candidates');

    let filePath = 'data/votingCandidates.json';
    const candidateData = JSON.parse((await readFile(filePath)));

    const insertPositionQuery = 'INSERT INTO positions (name) VALUES ($1) RETURNING id;'
    const insertCandidateQuery = 'INSERT INTO candidates (name, position_id) VALUES ($1, $2);';
    const updatePositionNameQuery = 'UPDATE positions SET name = $1 WHERE id = $2;';
    db.transaction(IsolationLevel.ReadUncommitted, async (client) => {
        for (let position of Object.keys(candidateData)) {
            console.log(`Inserting "${position}"`);
            const { rows: [{ id: positionId }] } = await client.query(insertPositionQuery, [position]);
            if (candidateData[position].length > 1) {
                candidateData[position] = [
                    ...candidateData[position],
                    { name: 'Abstain' },
                    { name: 'No Confidence' },
                ];
            } else if (candidateData[position].length === 1) {
                position = `${position} - ${candidateData[position][0].name}`;
                candidateData[position] = [
                    { name: 'Yes' },
                    { name: 'No' },
                    { name: 'Abstain' },
                ];
                await client.query(updatePositionNameQuery, [position, positionId]);
            } else {
                console.log(`Ignoring ${position}, no candidates`);
            }
            await Promise.all(
                candidateData[position].map(({ name }) => client.query(insertCandidateQuery, [name, positionId]))
            );
        }
    });

    if (process.env.VALIDATE_USERS === 'true') {
        console.log('Resetting valid voter table');
        await db.query('DELETE FROM valid_users;');

        filePath = 'data/voters.json';
        const voterData = JSON.parse((await readFile(filePath)));

        const insertUserQuery = 'INSERT INTO valid_users (email) VALUES ($1);';
        db.transaction(IsolationLevel.ReadUncommitted, async (client) => {
            console.log('Inserting valid voters');
            await Promise.all(voterData.map(email => client.query(insertUserQuery, [email])));
        });
    }
}

main().catch(err => console.error(err));
