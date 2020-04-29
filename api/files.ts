import fs from 'fs';

const ENCODING = 'utf8';

export const writeToFile = (pathToFile: string, contentToWrite: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(pathToFile, contentToWrite, ENCODING, (err) => {
            if (err) {
                console.error(err)
                reject(err)
                return
            }
            resolve()
        });
    })
}

export const readFile = (pathToFile: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        fs.readFile(pathToFile, ENCODING, (err, data) => {
            if (err) {
                console.error(err)
                reject(err)
                return
            }
            resolve(data)
        })
    })
}