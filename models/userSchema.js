const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  userId: Number,
  userName: String,
  userPwd: String,
  userEmail: String,
  mobile: String,
  sex: Number,
  deptId: [], // 部门
  job: String,
  state: {
    type: Number,
    default: 1
  }, // 1:在职 2:离职 3:试用期
  role: {
    type: Number,
    default: 1
  }, // 用户角色 0:系统管理员 1:普通用户
  roleList: [],
  createTime: {
    type: Date,
    default: Date.now()
  },
  lastLoginTime: {
    type: Date,
    default: Date.now()
  },
  remark: String
})

module.exports = mongoose.model('users', userSchema, 'users')