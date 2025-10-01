const policies = {
  todo: () => import('#policies/todo_policy'),
  user: () => import('#policies/user_policy'),
}

export default policies
