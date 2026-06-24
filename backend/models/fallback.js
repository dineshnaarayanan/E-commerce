import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFolder = path.join(__dirname, '../db');

// Ensure db folder exists
try {
  await fs.mkdir(dbFolder, { recursive: true });
} catch (e) {}

class JSONQuery {
  constructor(promise, isFindOne = false) {
    this.promise = promise;
    this.sortQuery = null;
    this.isFindOne = isFindOne;
  }

  sort(sortQuery) {
    this.sortQuery = sortQuery;
    return this;
  }

  then(onFulfilled, onRejected) {
    return this.promise.then(list => {
      const resultList = [...list];
      if (this.sortQuery) {
        const key = Object.keys(this.sortQuery)[0];
        const direction = this.sortQuery[key];
        resultList.sort((a, b) => {
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return direction === -1 ? 1 : -1;
          if (valA > valB) return direction === -1 ? -1 : 1;
          return 0;
        });
      }
      return this.isFindOne ? (resultList[0] || null) : resultList;
    }).then(onFulfilled, onRejected);
  }
}

export class JSONModel {
  constructor(modelName) {
    this.modelName = modelName;
    this.filePath = path.join(dbFolder, `${modelName}.json`);
  }

  async read() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  async write(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  decorate(item) {
    if (!item) return null;
    const self = this;
    return {
      ...item,
      save: async function() {
        const list = await self.read();
        const idx = list.findIndex(x => {
          if (x.id !== undefined && this.id !== undefined) return x.id === this.id;
          if (x._id !== undefined && this._id !== undefined) return x._id === this._id;
          if (x.username !== undefined && this.username !== undefined) return x.username === this.username;
          if (x.utrNumber !== undefined && this.utrNumber !== undefined) return x.utrNumber === this.utrNumber;
          return false;
        });
        
        const toSave = { ...this, updatedAt: new Date().toISOString() };
        // Remove helper functions from JSON serialization
        delete toSave.save;
        
        if (idx !== -1) {
          list[idx] = toSave;
        } else {
          list.push(toSave);
        }
        await self.write(list);
        return this;
      }
    };
  }

  find(query = {}) {
    const promise = (async () => {
      const list = await this.read();
      let filtered = list;
      
      if (Object.keys(query).length > 0) {
        filtered = list.filter(item => {
          for (const key in query) {
            if (item[key] !== query[key]) return false;
          }
          return true;
        });
      }
      
      return filtered.map(item => this.decorate(item));
    })();
    
    return new JSONQuery(promise, false);
  }

  findOne(query = {}) {
    const promise = (async () => {
      const list = await this.read();
      let filtered = list;
      
      if (Object.keys(query).length > 0) {
        filtered = list.filter(item => {
          for (const key in query) {
            if (item[key] !== query[key]) return false;
          }
          return true;
        });
      }
      
      return filtered.map(item => this.decorate(item));
    })();
    
    return new JSONQuery(promise, true);
  }

  async countDocuments() {
    const list = await this.read();
    return list.length;
  }

  async insertMany(items) {
    const list = await this.read();
    const withTimestamps = items.map(item => {
      const cleaned = { ...item };
      // Strip any Mongoose object conversions
      delete cleaned._id;
      return {
        _id: 'json_' + Math.random().toString(36).substr(2, 9),
        ...cleaned,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });
    const newList = [...list, ...withTimestamps];
    await this.write(newList);
    return withTimestamps;
  }

  async create(item) {
    const list = await this.read();
    const newItem = {
      _id: 'json_' + Math.random().toString(36).substr(2, 9),
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newItem);
    await this.write(list);
    return this.decorate(newItem);
  }

  async findOneAndDelete(query) {
    const list = await this.read();
    const idx = list.findIndex(item => {
      for (const key in query) {
        if (item[key] !== query[key]) return false;
      }
      return true;
    });
    if (idx === -1) return null;
    const removed = list.splice(idx, 1)[0];
    await this.write(list);
    return removed;
  }
}
