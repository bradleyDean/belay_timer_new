
export interface PathAndFileNameMap {
  [key:string]: string; //key<->the path and the filename, value<-> the path to use
}

export const pathMap:PathAndFileNameMap = {
  "users": "users.txt",
  "ledgers": "ledgers.txt",
  "owner" : "owner.txt"
}
