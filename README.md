check-source-formatting
=======================

## Description

Runs common checks against your files to check for issues according to Liferay's formatting guidelines.

### What it checks
This will scan through HTML(-like) files, JS files, and CSS files and detect many common patterns or issues that violate our source formatting rules, such as:

#### CSS (.css and .scss)
- Properties being unalphabetized, such as `color: #FFF; border: 1px solid;`
- Longhand hex codes that can be shorthanded, such as `#FFFFFF`
- Unneeded units, such as `0px` or `0em`
- Missing integers, in cases such as `opacity: .4;`
- Lower or mixed case hex codes, such as `#fff`
- Mixed spaces and tabs
- Comma separated lists that are missing spaces, such as `rgb(0,0,0)`
- Trailing new lines in nested rules
- Misc. property formatting/spacing

#### HTML(-like) files, such as JSP, VM, FTL, etc
- Attributes that are unalphabetized, such as `<span id="test" class="foo">`
- Attribute values that are unalphabetized, such as `<span class="lfr-foo hide">`

#### JavaScript
- Mixed spaces and tabs
- Double quoted strings that should be single quoted
- Stray debugging calls, such as `console.log`, `console.info`, etc
- Functions that are improperly formatted, such as `function (`
- Function arguments that are improperly formatted, such as `.on('foo', function(event) {`
- Invalid bracket placement, such as `){` or `} else {`
- Properties or methods that are non-alphabetically listed
- Trailing commas in arrays and objects
- Variables that are all defined in one statement
- Variables being passed to `Liferay.Language.get()`
- Trailing or extraneous newlines
- Variable names starting with `is` (it ignores methods, which is valid, but properties and variables should not have a prefix of `is`)
- **Experimental** Will try to parse JavaScript inside of <aui:script> blocks

## Installation

```
<sudo> npm install -g check-source-formatting
```

## Running

The simplest way to run it is:

```
check_sf path/to/file
```

However, you can also check multiple files at once:

```
find . -name '*.css' | xargs check_sf
```

I find it easier to use it with pull requests and check the files that were changed on the branch.
In my .gitconfig I have:

```
sfm = "!f() { git diff --stat --name-only master.. | grep -E '.(jsp.?|vm|ftl|js|(s)?css)$' | tr \"\\n\" \"\\0\" | xargs -0 -J{} check_sf {} $@; }; f"
```

(You could get rid of the grep portion, but I find it easier to just filter them out on this level).

When someone sends me a pull request, I check out the branch and run `git sfm` and it scans the changed files and reports any issues.

## Options

There are some options that you can pass to the command:

`-q, --quiet` will set it so that it only shows files that have errors. By default it will log out all files and report 'clear' if there are no errors.

`-o, --open` If you have an editor specified in your gitconfig (under user.editor), this will open all of the files that have errors in your editor.

`-i, --inline-edit` For some of the errors (mainly the ones that can be safely changed), if you pass this option, it will modify the file and convert the error to a valid value.

### Experimental or less used options

`-r, --relative` This will display the files passed in as relative to you current directory.
This is mainly useful when you want to show the file name relative to your current working directory.
I use it mainly when I'm running this on a git branch. In order for it to work from your alias, you would need to change the above alias to be:
```
sfm = "!f() { export GIT_PWD=\"$GIT_PREFIX\"; git diff --stat --name-only master.. | grep -E '.(jsp.?|vm|ftl|js|(s)?css)$' | xargs check_sf $@; }; f"
```

`-v, --verbose` This will log out any possible error, even ones that are probably a false positive.
Currently, there's only one testable case of this, which is where you have something like this:
```
<span class="lfr-foo"><liferay-ui:message key="hello-world" /></span>
```
This will say there's an error (that the attributes are out of order), but since we can tell there's a `><` between the attributes, we know that it's more than likely not a real error.

However, passing -v will show these errors (marked with a **).

`--color`, `--no-color` If you don't pass anything, `--color` defaults to true, which colors the output for the terminal. However, there may be times you need to pass the output of the script to other scripts, and want to have the output in a plain text format.

If you pass `--no-color` it will overwrite the default and give you plain text.

## Known issues
The following are known issues where it will say there's an error, but there's not (or where there should be an error but there's not)

- If you have multiple tags on one line, but separated by spaces, like the following:
```
<span class="lfr-foo">(<liferay-ui:message key="hello-world" />)</span>
```
then it will still flag that as an error
- Spaces inside of JS comments will most of the time get flagged as mixed tabs and spaces
- Double quotes inside of JS (like inside of a regex or in a comment), will get flagged as an error.