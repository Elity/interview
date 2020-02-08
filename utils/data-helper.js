/**
 * 从对象obj中剔除keys后返回新对象
 * @param obj
 * @param keys
 *
 * omit({a:1,b:2,c:3},'a','c') ===> {b:2}
 * omit({a:1,b:2,c:3},['a','c']) ===> {b:2}
 * omit({a:1,b:2,c:3},{b:2}) ===> {a:1,c:3}
 * omit({a:1,b:2,c:3},{b:3}) ===> {a:1,b:2.c:3}
 */
export function omit(obj, ...keys) {
  if (!obj || typeof obj !== 'object') {
    throw new TypeError('omit 第一个参数应该为对象类型')
  }
  if (keys.length === 1 && keys[0] && typeof keys[0] === 'object') {
    // eslint-disable-next-line
    keys = keys[0]
  }
  const isArr = Array.isArray(keys)
  return Object.keys(obj).reduce((acc, cur) => {
    if (cur !== undefined) {
      if (isArr) {
        if (!keys.includes(cur)) acc[cur] = obj[cur]
      } else if (!Object.is(keys[cur], obj[cur])) {
        acc[cur] = obj[cur]
      }
    }
    return acc
  }, {})
}

/**
 * 从对象obj中选取keys成为新对象
 * @param obj
 * @param keys
 *
 * pick({a:1,b:2,c:3},'a','c') ===> {a:1,c:3}
 * pick({a:1,b:2,c:3},['a','c']) ===> {a:1,c:3}
 */
export function pick(obj, ...keys) {
  if (!obj || typeof obj !== 'object') {
    throw new TypeError('pick 第一个参数应该为对象类型')
  }
  if (keys.length === 1 && Array.isArray(keys[0])) {
    // eslint-disable-next-line
    keys = keys[0]
  }
  return keys.reduce((acc, cur) => {
    if (cur !== undefined && obj[cur] !== undefined) acc[cur] = obj[cur]
    return acc
  }, {})
}

/**
 *
 * 将obj中的key依据maps进行映射
 * obj {a:1,b:2} maps {a:'c'}  => {c:1,b:2}
 * @param obj
 * @param maps
 */
export function mapKeys(obj, maps = {}) {
  if (!obj || typeof obj !== 'object') {
    throw new TypeError('mapKeys 第一个参数应该为对象类型')
  }
  return Object.keys(obj).reduce((acc, cur) => {
    const mapTo = maps[cur]
    if (mapTo !== undefined) {
      acc[mapTo] = obj[cur]
    } else {
      acc[cur] = obj[cur]
    }
    return acc
  }, {})
}
