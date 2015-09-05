rsrc/%.html:rsrc/%.md rsrc/%.scss
	pandoc -s -c intro.scss -o $@ $<
	open $@
