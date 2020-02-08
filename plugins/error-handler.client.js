import Vue from 'vue'
import { showError } from '@/utils'

Vue.config.errorHandler = function handleError(err, vm) {
  showError(err, true)
  throw err
}
