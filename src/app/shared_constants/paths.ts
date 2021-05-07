
export interface PathAndFileNameMap {
  [key:string]: string; //key<->the path and the filename, value<-> the path to use
}

export const pathMap:PathAndFileNameMap = {
  "users": "users.txt",
  "ledgers": "ledgers", //this is part of a path in the form `ledgers/${uid}`, for some uid
  "owner" : "owner.txt"
}
