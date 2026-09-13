import storage from '@system.storage';

const memCache = {};

export default {
  /**
   * 获取存储的值（JSON 自动解析）
   */
  get(key, defaultValue = null) {
    return new Promise((resolve) => {
      try {
        storage.get({
          key: key,
          default: '',
          success: (data) => {
            if (!data) {
              resolve(memCache[key] !== undefined ? memCache[key] : defaultValue);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              resolve(parsed);
            } catch (e) {
              resolve(data);
            }
          },
          fail: (data, code) => {
            console.error(`[Storage] get failed: ${code}`);
            resolve(memCache[key] !== undefined ? memCache[key] : defaultValue);
          }
        });
      } catch (err) {
        console.error(`[Storage] get exception: ${err}`);
        resolve(memCache[key] !== undefined ? memCache[key] : defaultValue);
      }
    });
  },

  /**
   * 保存存储的值（支持对象自动 JSON.stringify）
   */
  set(key, value) {
    memCache[key] = value;
    return new Promise((resolve, reject) => {
      try {
        const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
        storage.set({
          key: key,
          value: valStr,
          success: () => {
            resolve(true);
          },
          fail: (data, code) => {
            console.error(`[Storage] set failed: ${code}`);
            resolve(false);
          }
        });
      } catch (err) {
        console.error(`[Storage] set exception: ${err}`);
        resolve(false);
      }
    });
  },

  /**
   * 删除某个 key
   */
  delete(key) {
    delete memCache[key];
    return new Promise((resolve) => {
      try {
        storage.delete({
          key: key,
          success: () => resolve(true),
          fail: () => resolve(false)
        });
      } catch (e) {
        resolve(false);
      }
    });
  }
};
