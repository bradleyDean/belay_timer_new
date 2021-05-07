import { BelayLedger  } from '../interfaces/ledgers';
import {convertDateToDDMMYYYYString} from '../services/ledger.service';

let date = new Date(2019, 7, 28);
const date_1 = convertDateToDDMMYYYYString(date);

date = new Date(2019, 8, 3);
const date_2 = convertDateToDDMMYYYYString(date);

date = new Date(2020, 5, 14);
const date_3 = convertDateToDDMMYYYYString(date);

date = new Date(2020, 6, 1);
const date_4 = convertDateToDDMMYYYYString(date);

date = new Date(2020, 11, 16);
const date_5 = convertDateToDDMMYYYYString(date);

date = new Date(2021, 3, 29);
const date_6 = convertDateToDDMMYYYYString(date);


export const belayLedger_1:BelayLedger = {
  subject_id:1,
  belay_records:{
    [date_1]:{
      gave:{
        2: 33,
        4: 126,
        9: 325
      },
      recieved:{2:25, 4: 130, 9: 300}
    },
    [date_2]:{
      gave:{2:57},
      recieved:{2:64}
    },
    [date_3]:{
      gave:{4:126},
      recieved:{4:175}
    }
  }

}


export const empty_belay_ledger:BelayLedger = {
  subject_id:2,
  belay_records:{
    [date_4]:{
      gave:{},
      recieved:{}
    },
    [date_5]:{
      gave:{},
      recieved:{}
    },
    [date_6]:{
      gave:{},
      recieved:{}
    }
  }

}

// export const belayLedger_no_belay_records:BelayLedger = {
//   subject_id:1,
// }
