import { useQuery } from "react-query"

export function userUserData(userId) {
  const userData = useQuery(
    ["users", userId],
    () => fetch(`/api/users/${userId}`)
      .then(res => res.json())
  )

  return userData;
}