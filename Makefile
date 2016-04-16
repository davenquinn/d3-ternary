COFFEE=node_modules/.bin/coffee

all:
	$(COFFEE) -c -o lib src

watch:
	$(COFFEE) -wc -o lib src
