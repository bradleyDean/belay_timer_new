import { Injectable } from '@angular/core';
import { Plugins,FilesystemDirectory, FilesystemEncoding } from '@capacitor/core';

const { Filesystem } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  fileSys: typeof Filesystem;

  constructor(){
    // console.log('File Service Constructor Called!')
    this.fileSys = Filesystem;
  }

  async fileWrite(path:string, data:any, do_log_result: boolean = false, recursive = false) {
    if (typeof data != typeof "hi"){
      data = JSON.stringify(data);
    }
    try {
      const result = await Filesystem.writeFile({
        path:path,
        data:data,
        directory: FilesystemDirectory.Data, //using the Data directory
        encoding: FilesystemEncoding.UTF8,
        recursive: recursive
      })
      if(do_log_result){
        console.log('Wrote file', result);
      }
      return result;
    } catch(e) {
      if(do_log_result){
        console.error('Unable to write file', e);
      }
      throw(e);
    }
  }

  //make another method that wraps this and checks if the directory exists and maybe if the file exists too?
  async fileRead(path:string, do_log_result:boolean = false) {
    let contents = await Filesystem.readFile({
      path: path,
      directory: FilesystemDirectory.Data,
      encoding: FilesystemEncoding.UTF8
    });
    if(do_log_result){
      console.log(`file.service, read file at path ${path} as:`);
      console.log(JSON.parse(contents.data));
    }

    return JSON.parse(contents.data);
  }

  //TODO: not finished
  async rmDir(path:string, recursive: boolean = false){
    try{
      const result = await Filesystem.rmdir({
        path:path,
        recursive: recursive});
      return result;
      }
    catch(error){
      throw(error);
    };
  }

  //The path should include the file name
  async rmFile(path:string){
    try{
      const result = await Filesystem.deleteFile({
        path:path,
        directory: FilesystemDirectory.Data})
      return result;
    }
    catch(error){
      throw(error);
    };
  }

  checkListForItem(item:string, list:string[]) {
    for (let file_name of list) {
      if (file_name === item) {
        return true;
      }
    }
    return false;
  }

  getPathAndFileNameFromPath(path:string):{dir_path:string, file_name:string}{

    const slash_index = path.lastIndexOf("/");
    let file_name:string;

    if (slash_index === -1){
      // console.log(`SETTING FILENAME TO PATH `);
      file_name = path;
      // console.log(`FILENAME IS : ${file_name}`)
      path = "";
    }else{
      file_name = path.slice(slash_index + 1);
      //TODO Test that this is correct... This removes the last "/" from the path.
      path = path.slice(0,slash_index);
    }
    return {
      dir_path:path,
      file_name:file_name
    }
  }

  /*
  * Returns `true` or `false` depending on if the file or directory exists
  *
  * @remarks
  * Errors due to non-existant directories are supressed and `false` is returned.
  */
  async fileOrDirExists(path:string, directory = FilesystemDirectory.Data ):Promise<boolean>{
    const path_and_name = this.getPathAndFileNameFromPath(path);
    // console.log(`fileOrDirExists got path_and_name as :`);
    // console.log(path_and_name);
    try {
      let ret  = await Filesystem.readdir({
        path: path_and_name["dir_path"],
        directory: directory
      });
      // console.log("Files:");
      // console.log(ret.files);
    if (this.checkListForItem(path_and_name["file_name"], ret.files)) {
      // console.log("It exists!");
      return true;
    }
    else {
      return false;
    }
    }
    catch(e) {
      console.log('Unable to read dir: ' + e);
      return false;
    }
  }
}
