MD = $(wildcard rsrc/*.md)
HTML = $(MD:rsrc/%.md=meteor/private/%.html)

all: meteor/settings.json meteor/private/bib.json $(HTML)

meteor/private:
	mkdir -p meteor/private

meteor/private/%:rsrc/% meteor/private
	cp $< $@
meteor/settings.json:rsrc/settings.json
	cp $< $@

meteor/private/%.html:rsrc/%.md meteor/private
	pandoc -o $@ $<

.PHONY: run
run: all
	-pkill meteor
	cd meteor; meteor --settings settings.json
