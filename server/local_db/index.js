const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

const basePath = process.env.YAML_BASE_PATH || path.join(__dirname);

/**
 * Gets the full path to a YAML file based on the given name.
 * @param {string} name - The base name of the YAML file (without extension).
 * @returns {string} The full path to the YAML file.
 */
function getYamlFilePath(name) {
    return path.join(basePath, `${name}.yaml`);
}

/**
 * Reads and parses a YAML file.
 * @param {string} name - The base name of the YAML file (without extension).
 * @returns {Object} The parsed content of the YAML file.
 * @throws Will throw an error if the file does not exist.
 */
function readYaml(name) {
    const filePath = getYamlFilePath(name);
    if (!fs.existsSync(filePath)) {
        throw new Error(`YAML file not found: ${filePath}`);
    }
    const content = fs.readFileSync(filePath, 'utf8');
    return yaml.parse(content);
}

/**
 * Serializes and writes an object to a YAML file.
 * @param {string} name - The base name of the YAML file (without extension).
 * @param {Object} data - The data to be written to the YAML file.
 */
function writeYaml(name, data) {
    const filePath = getYamlFilePath(name);
    const yamlStr = yaml.stringify(data);
    fs.writeFileSync(filePath, yamlStr, 'utf8');
}

/**
 * Updates a specific nested field in a YAML file.
 * Creates intermediate objects if necessary.
 * @param {string} name - The base name of the YAML file (without extension).
 * @param {string[]} pathArray - An array representing the path to the field.
 * @param {*} value - The new value to set at the specified path.
 */
function updateYamlField(name, pathArray, value) {
    const data = readYaml(name);

    let current = data;
    for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) current[pathArray[i]] = {};
        current = current[pathArray[i]];
    }
    current[pathArray[pathArray.length - 1]] = value;

    writeYaml(name, data);
}

/**
 * Deletes a specific nested field from a YAML file.
 * @param {string} name - The base name of the YAML file (without extension).
 * @param {string[]} pathArray - An array representing the path to the field.
 * @throws Will throw an error if the path does not exist.
 */
function deleteYamlField(name, pathArray) {
    const data = readYaml(name);

    let current = data;
    for (let i = 0; i < pathArray.length - 1; i++) {
        if (!current[pathArray[i]]) {
            throw new Error(`Path not found: ${pathArray.join('.')}`);
        }
        current = current[pathArray[i]];
    }

    delete current[pathArray[pathArray.length - 1]];
    writeYaml(name, data);
}

/**
 * Deletes a YAML file.
 * @param {string} name - The base name of the YAML file (without extension).
 * @throws Will throw an error if the file does not exist.
 */
function deleteYamlFile(name) {
    const filePath = getYamlFilePath(name);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${name}.yaml`);
    }
    fs.unlinkSync(filePath);
}

/**
 * Creates a new YAML file with optional initial data.
 * @param {string} name - The base name of the YAML file (without extension).
 * @param {Object} [initialData={}] - The initial data to write to the YAML file.
 * @throws Will throw an error if the file already exists.
 */
function createYamlFile(name, initialData = {}) {
    const filePath = getYamlFilePath(name);
    if (fs.existsSync(filePath)) {
        throw new Error(`YAML file already exists: ${name}.yaml`);
    }

    const yamlStr = yaml.stringify(initialData);
    fs.writeFileSync(filePath, yamlStr, 'utf8');
}

module.exports = {
    readYaml,
    writeYaml,
    updateYamlField,
    deleteYamlField,
    deleteYamlFile,
    createYamlFile,
};
