export const state = () => ({
  userInfo: null,
  roles: []
})

export const mutations = {
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
  },
  SET_ROLES(state, roles) {
    state.roles = roles
  },
  LOGOUT(state) {
    state.userInfo = null
  }
}

export const actions = {
  async login({ commit }, { username, password }) {
    const res = await this.$AV.User.logIn(username, password)
    commit('SET_USER_INFO', res.toJSON())
  },
  async register({ commit }, { username, password, email }) {
    const user = new this.$AV.User()
    user.setUsername(username)
    user.setPassword(password)
    user.setEmail(email)
    const res = await user.signUp()
    commit('SET_USER_INFO', res.toJSON())
  },
  async getUserInfo({ commit }) {
    const user = this.$AV.User.current()
    if (user) {
      const roles = await user.getRoles()
      commit(
        'SET_ROLES',
        roles.map((role) => role.get('name'))
      )
      const obj = user.toJSON()
      commit('SET_USER_INFO', obj)
      return obj
    }
    return user
  },
  async logout({ commit }) {
    await this.$AV.User.logOut()
    commit('LOGOUT')
  }
}

export const getters = {
  userInfo(state) {
    return state.userInfo
  },
  roles(state) {
    return state.roles
  }
}
