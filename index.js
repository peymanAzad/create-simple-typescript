#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");
const inq = require("inquirer");
const { assert } = require("console");
const Mustache = require("mustache");
const chalk = require("chalk");

const main = async () => {
	const projectName = process.argv[2]
		? process.argv[2]
		: await questionProjectName();
	assert(projectName, "project name is not specified");
	const baseOutputPath = path.join(process.cwd(), "/" + projectName);
	await fs.ensureDir(baseOutputPath);
	await copySrcFile(baseOutputPath);
	await copyConfigFiles(baseOutputPath, projectName);
	displaySuccesMessage(projectName, baseOutputPath);
};

const questionProjectName = async () => {
	const { projectName } = await questionInput(
		"projectName",
		"project name?",
		"my-ts-project"
	);
	return projectName;
};

const questionInput = async (name, message, defaultvalue) =>
	inq.prompt({
		type: "input",
		message,
		default: defaultvalue,
		name,
	});

const renderCopy = async (srcPath, view, outputPath) => {
	const template = await fs.readFile(srcPath, "utf8");
	const rendered = Mustache.render(template, view);
	await fs.outputFile(outputPath, rendered);
};

const copySrcFile = async (baseOutputPath) => {
	const srcPath = path.join(baseOutputPath, "src");
	await fs.ensureDir(srcPath);
	await fs.copyFile(
		path.join(__dirname, "/files/index.ts"),
		path.join(srcPath, "/index.ts")
	);
};

const copyConfigFiles = async (baseoutput, projName) => {
	const baseConfigfilesPath = path.join(__dirname, "/files");
	await copyTsConfigFile(baseoutput);
	await copyPackageJsonFile(baseoutput, projName);
	await fs.copyFile(
		path.join(baseConfigfilesPath, "/Dockerfile"),
		path.join(baseoutput, "/Dockerfile")
	);
	await fs.copyFile(
		path.join(baseConfigfilesPath, "/gitignore"),
		path.join(baseoutput, "/.gitignore")
	);
	await fs.copyFile(
		path.join(baseConfigfilesPath, "/dockerignore"),
		path.join(baseoutput, "/.dockerignore")
	);
};

const copyTsConfigFile = (outputPath) => {
	return fs.copyFile(
		path.join(__dirname, "/files/typescript.json"),
		path.join(outputPath, "/tsconfig.json")
	);
};

const copyPackageJsonFile = async (outputPath, projName) => {
	await renderCopy(
		path.join(__dirname, "/files/package.template"),
		{
			projName,
		},
		path.join(outputPath, "/package.json")
	);
};

const displaySuccesMessage = (projName, outputPath) => {
	console.log(
		`${chalk.green(
			"Seccess!"
		)} created ${projName} at ${outputPath}\nInside that directory run ${chalk.blue(
			"'yarn' or 'npm i'"
		)} for installing dependencies.\nThen you can run these commands:\n${chalk.blue(
			"'yarn build' or 'npm run build'"
		)}\n\tfor building typescript\n${chalk.blue(
			"'yarn watch' or 'npm run watch'"
		)}\n\tfor building and watching typescript files for changes\n${chalk.blue(
			"'yarn start' or 'npm run start'"
		)}\n\tfor starting project\n${chalk.blue(
			"'yarn dev' or 'npm run dev'"
		)}\n\tfor starting project with nodemon\n${chalk.blue(
			"'yarn debug' or 'npm run debug'"
		)}\n\tfor debuging\n${chalk.green("created with love!")}\n${chalk.green(
			"happy coding!"
		)}`
	);
};

main();
