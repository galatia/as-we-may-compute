rsrc/%.html:rsrc/%.md rsrc/%.scss
	pandoc -s -c $*.scss -A rsrc/font_script.html -o $@ $<
	open $@
