# OpenGov Analyzer

This tool checks whether the described datasets in files/govData_CSV.json provide any URLS.
It only parses csv-files.
Results are written in files/results.txt

## Installation

### Prequisites

* Install node
* Install grunt-cli
	* npm install -g grunt-cli

### Best Case

run 'grunt ts:app run:app'

### Worst Case

* remove contents of node_modules
* run 'npm install'
* run grunt ts:app run:app

## Attention

Execution takes a long time!