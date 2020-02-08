import { Message } from 'element-ui'

/**
 *
 * 显示一条错误消息
 * @param {*} err 错误对象 或 错误文本
 * @param {*} clearAll 是否清除其他正在显示的错误提醒
 */
export function showError(err = '', clearAll = true) {
  if (clearAll) Message.closeAll()
  Message.error(
    err.msg || err.message || err || '系统错误，请刷新页面或联系管理员'
  )
}
