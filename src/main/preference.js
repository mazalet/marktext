import fs from 'fs'
import path from 'path'
import { getPath, log } from './utils'

const FILE_NAME = 'preference.md'
const staticPath = path.join(__static, FILE_NAME)
const userDataPath = path.join(getPath('userData'), FILE_NAME)

class Preference {
  constructor (staticPath, userDataPath) {
    this.cache = null
    this.staticPath = staticPath
    this.userDataPath = userDataPath

    if (!fs.existsSync(userDataPath)) {
      const content = fs.readFileSync(staticPath, 'utf-8')
      fs.writeFileSync(userDataPath, content, 'utf-8')
    }
  }

  getAll () {
    const JSON_REG = /```json(.+)```/g
    const { userDataPath, cache } = this
    if (cache) {
      return cache
    } else {
      const content = fs.readFileSync(userDataPath, 'utf-8')
      try {
        const userSetting = JSON_REG.exec(content.replace(/\n/g, ''))[1]
        this.cache = JSON.parse(userSetting)
        return this.cache
      } catch (err) {
        log(err)
      }
    }
  }

  setItem (key, value) {
    const { userDataPath } = this
    const preUserSetting = this.getAll()
    const newUserSetting = this.cache = Object.assign({}, preUserSetting, { [key]: value })

    return new Promise((resolve, reject) => {
      const content = fs.readFileSync(userDataPath, 'utf-8')
      const tokens = content.split('```')
      const newContent = tokens[0] +
        '```json\n' +
        JSON.stringify(newUserSetting, null, 2) +
        '\n```' +
        tokens[2]
      fs.writeFile(userDataPath, newContent, 'utf-8', err => {
        if (err) reject(err)
        else resolve(newUserSetting)
      })
    })
  }
}

export default new Preference(staticPath, userDataPath)
