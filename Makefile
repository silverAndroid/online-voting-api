build:
	docker build -t ieeeuottawa/online-voting .
start:
	make start-quick
	docker-compose run online-voting npm run migrate
	docker-compose run online-voting npm run setup
start-quick:
	docker-compose up -d online-voting
stop:
	docker-compose down
restart:
	make stop
	make start-quick
rebuild:
	make build
	make restart
update:
	git fetch origin master
	git rebase origin/master
	make rebuild
