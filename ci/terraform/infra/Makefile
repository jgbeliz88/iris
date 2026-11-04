SHELL := /bin/bash

red:=$(shell tput setaf 1)
green:=$(shell tput setaf 2)
orange:=$(shell tput setaf 3)
blue:=$(shell tput setaf 4)
magenta:=$(shell tput setaf 5)
reset:=$(shell tput sgr0)

ROOT := $(shell pwd)
DIR  := $(notdir $(ROOT))

SISTEMA=$(shell uname -s)

## Nombre de la Aplicación p.e. rwd
APP_NAME=$(shell jq -r '.app' ${ROOT}/../../project.json)
## Nombre de la proyecto p.e. faceman
PRJ_NAME=$(shell jq -r '.project_name' ${ROOT}/../../project.json)

.PHONY: fmt validate install-transit install-main bootstrap status reset port-forward operations test

init:
	cd  "${ROOT}"
	terraform init -backend-config="key=${APP_NAME}/${PRJ_NAME}/${DIR}/terraform.tfstate"
