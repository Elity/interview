import AV from 'leancloud-storage'

// AV.debug.enable()
AV.init({
  appId: 'L9zrA0qHBAsKDkq06mAySUui-gzGzoHsz',
  appKey: 'L2nUDdhyEkGFpy9sMjfjgRaz',
  serverURLs: 'https://l9zra0qh.lc-cn-n1-shared.com'
})

export default ({ app }, inject) => {
  inject('AV', AV)
}
