const fs = require('fs');
const path = require('path');

// Use a temp directory for YAML files during testing
const testDir = path.join(__dirname, 'tmp');
process.env.YAML_BASE_PATH = testDir;

const {
    readYaml,
    writeYaml,
    updateYamlField,
    deleteYamlField,
    deleteYamlFile,
    createYamlFile,
} = require('../local_db');

const testFileName = 'test_config';
const testFilePath = path.join(testDir, `${testFileName}.yaml`);

beforeAll(() => {
    if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir);
    }
});

beforeEach(() => {
    if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
    }
});

afterEach(() => {
    if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
    }
});

afterAll(() => {
    // Remove the test file if it still exists
    if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
    }

    // Remove the test directory
    if (fs.existsSync(testDir)) {
        fs.rmdirSync(testDir); // Use fs.rmSync(testDir, { recursive: true }) for Node 16+
    }
});

describe('YAML utility functions', () => {
    test('createYamlFile should create a new YAML file', () => {
        const data = { app: 'test', version: 1 };
        createYamlFile(testFileName, data);
        expect(fs.existsSync(testFilePath)).toBe(true);

        const content = readYaml(testFileName);
        expect(content).toEqual(data);
    });

    test('writeYaml should overwrite existing file', () => {
        createYamlFile(testFileName, { initial: true });

        const newData = { updated: true };
        writeYaml(testFileName, newData);

        const content = readYaml(testFileName);
        expect(content).toEqual(newData);
    });

    test('updateYamlField should set a nested value', () => {
        createYamlFile(testFileName, {});
        updateYamlField(testFileName, ['database', 'host'], 'localhost');

        const content = readYaml(testFileName);
        expect(content).toEqual({
            database: {
                host: 'localhost',
            },
        });
    });

    test('deleteYamlField should remove a nested field', () => {
        createYamlFile(testFileName, {
            database: {
                host: 'localhost',
                port: 5432,
            },
        });

        deleteYamlField(testFileName, ['database', 'port']);
        const content = readYaml(testFileName);
        expect(content).toEqual({
            database: {
                host: 'localhost',
            },
        });
    });

    test('deleteYamlFile should remove the file', () => {
        createYamlFile(testFileName, { foo: 'bar' });
        expect(fs.existsSync(testFilePath)).toBe(true);

        deleteYamlFile(testFileName);
        expect(fs.existsSync(testFilePath)).toBe(false);
    });

    test('readYaml should throw if file does not exist', () => {
        expect(() => readYaml('nonexistent')).toThrow(/YAML file not found/);
    });

    test('createYamlFile should throw if file already exists', () => {
        createYamlFile(testFileName, {});
        expect(() => createYamlFile(testFileName, {})).toThrow(/already exists/);
    });

    test('deleteYamlField should throw if path does not exist', () => {
        createYamlFile(testFileName, {});
        expect(() => deleteYamlField(testFileName, ['nonexistent', 'path']))
            .toThrow(/Path not found/);
    });
});
