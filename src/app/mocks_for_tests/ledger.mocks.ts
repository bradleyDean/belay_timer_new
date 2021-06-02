import { BelayLedger  } from '../interfaces/ledgers';
import {convertDateToDDMMYYYYString_} from '../services/ledger.service';

let date = new Date(2019, 7, 28);
export const date_1 = convertDateToDDMMYYYYString_(date);

date = new Date(2019, 8, 3);
export const date_2 = convertDateToDDMMYYYYString_(date);

date = new Date(2020, 5, 14);
export const date_3 = convertDateToDDMMYYYYString_(date);

date = new Date(2020, 6, 1);
export const date_4 = convertDateToDDMMYYYYString_(date);

date = new Date(2020, 11, 16);
export const date_5 = convertDateToDDMMYYYYString_(date);

date = new Date(2021, 3, 29);
export const date_6 = convertDateToDDMMYYYYString_(date);


export const belayLedger_1:BelayLedger = {
  subject_id:"A",
  belay_records:{
    [date_1]:{
      gave:{
        "B": 33,
        "C": 126,
        "D": 325
      },
      recieved:{"B":25, "C": 130, "D": 300}
    },
    [date_2]:{
      gave:{"B":57},
      recieved:{"B":64}
    },
    [date_3]:{
      gave:{"C":126},
      recieved:{"C":175}
    }
  }

}


export const empty_belay_ledger:BelayLedger = {
  subject_id:"B",
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


export const belay_ledger_6_dates: BelayLedger = {
  subject_id:"A",
  belay_records:{
    [date_1]:{
      gave:{
        "B": 33,
        "C": 126,
        "D": 325
      },
      recieved:{"A":5, "B":25, "C": 130, "D": 300}
    },
    [date_2]:{
      gave:{"B":57},
      recieved:{"B":64}
    },
    [date_3]:{
      gave:{"C":126},
      recieved:{"A":10, "C":175}
    },
    [date_4] : {gave: {"B":10}, recieved: {"B":10}},

    [date_5] : {gave: {"B":10}, recieved: {"B":10}},

    [date_6] : {gave: {"B":10}, recieved: {"B":10}}
  }
}


// export const belayLedger_no_belay_records:BelayLedger = {
//   subject_id:1,
// }
