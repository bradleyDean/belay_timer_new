import { TestBed } from '@angular/core/testing';
import { FilesService} from './files.service';

//TODO: the checker would not catch objects that don't match in certain circumstances.
// if obj_2 has a key that obj_1 doesn't have, then this will not catch the mismatch
const objects_match_checker = (obj_1:any, obj_2:any)=>{
  let match_arr = Object.keys(obj_1).map(key => {
    try{
      // console.log(obj_1[key] + "..." + obj_2[key])
      return obj_1[key] === obj_2[key]
    }
    catch(error){
      return false;
    };
  });
  return match_arr.every(( el )=>{
    return el === true  ;
  })
}

describe('FilesService', () => {
  let service: FilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should write and read a given file at a specified path',(done: DoneFn)=>{
    const testData = {
      key_1: "hi there",
      key_2: 3
    };
    const path = "test_dir";
    service.fileWrite(path, testData).then(()=>{
      service.fileRead(path).then(( read_result )=>{

        expect(read_result["key_1"]).toBe(testData["key_1"])
        expect(read_result["key_2"]).toBe(testData["key_2"])

        done();
      }).catch((error)=>{
        throw error;
      });
    }).catch((error)=>{
      throw error;
    });
    //TODO: cleanup... delete the test file
  });

  it("should correctly parse a path that includes a filename",( )=>{

    const just_name = service.getPathAndFileNameFromPath("file_name.txt")
    const exp_name = {dir_path:"", file_name:"file_name.txt"}

    const one_level_and_name = service.getPathAndFileNameFromPath("lev_1/file_name.txt")
    const exp_one_level_and_name = {dir_path:"lev_1"  , file_name: "file_name.txt"}

    const two_levels_and_name = service.getPathAndFileNameFromPath("lev_1/lev_2/file_name.txt")
    const exp_two_level_and_name = {dir_path: "lev_1/lev_2", file_name:  "file_name.txt"}

    // console.log(`objects_match :${ objects_match } `);
    expect(objects_match_checker(just_name,exp_name ) &&
      objects_match_checker(one_level_and_name, exp_one_level_and_name) &&
      objects_match_checker(two_levels_and_name, exp_two_level_and_name)
    ).toBe(true);
  });

  it("should correctly check for the existance of a file or directory at various paths",  async (done:DoneFn)=>{
    //check for a nonexistant file at the root directory
    let exists1:boolean = await service.fileOrDirExists("not_a_real_file.txt");

    // check for a nonexistant file at a child directory that does not exist
    let exists2 = await service.fileOrDirExists("non_existant_dir/not_a_real_file.txt");

    //create a file at root directory to check
    await service.fileWrite("a_real_file.txt","some data");
    let exists_3 = await service.fileOrDirExists("a_real_file.txt");

    //create a file at nested directory to check
    await service.fileWrite("a_directory/a_real_file.txt","some data", false, true);
    let exists_4 = await service.fileOrDirExists("a_directory/a_real_file.txt");
    //clean up
    await service.rmFile("a_directory/a_real_file.txt");
    await service.rmDir("a_directory");

    // expect(exists).toBe(true);
    expect(exists1 === false &&
      exists2 === false &&
      exists_3 === true &&
      exists_4 === true
    ).toBeTrue();
    done();
  })

  
});
