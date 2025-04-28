
import { MarkedDates } from 'react-native-calendars/src/types';

const today = new Date().toISOString().split('T')[0];
const fastDate = getPastDate(3);
const futureDates = getFutureDates(12);
const dates = [fastDate, today].concat(futureDates);

function getFutureDates(numberOfDays: number) {
  const array: string[] = [];
  for (let index = 1; index <= numberOfDays; index++) {
    let d = Date.now();
    if (index > 8) {
      // set dates on the next month
      const newMonth = new Date(d).getMonth() + 1;
      d = new Date(d).setMonth(newMonth);
    }
    const date = new Date(d + 864e5 * index); // 864e5 == 86400000 == 24*60*60*1000
    const dateString = date.toISOString().split('T')[0];
    array.push(dateString);
  }
  return array;
}
function getPastDate(numberOfDays: number) {
  return new Date(Date.now() - 864e5 * numberOfDays).toISOString().split('T')[0];
}

function isEmpty(value: any): boolean {
  if (value == null) return true; // null or undefined is empty
  if (Array.isArray(value) || typeof value === 'string') return value.length === 0; // array or string with length 0 is empty
  if (typeof value === 'object') return Object.keys(value).length === 0; // object with no keys is empty
  return false; // any other case (e.g., numbers, booleans) are not empty
}

export const agendaItems = [
  {
    title: dates[0],
    data: [
      { hour: '8am', duration: '10pm', title: 'Beginner surf lesson' },
      { hour: '8:30am', duration: '12pm', title: 'Machado board rental' },
      { hour: '12pm', duration: '2pm', title: 'Long Yoga', itemCustomHeightType: 'LongEvent' }
    ],
  },
  {
    title: dates[1],
    data: [
      { hour: '8am', duration: '10pm', title: 'Beginner surf lesson' },
      { hour: '8:30am', duration: '12pm', title: 'Machado board rental' },
      { hour: '2pm', duration: '4:30pm', title: 'Advanced surf guiding', itemCustomHeightType: 'LongEvent' },
      { hour: '5pm', duration: '7pm', title: 'Sunset surf session', itemCustomHeightType: 'LongEvent' }
    ]
  },
  {
    title: dates[2],
    data: [
      { hour: '1pm', duration: '2pm', title: 'Ashtanga Yoga' },
      { hour: '2pm', duration: '4pm', title: 'Deep Stretches' },
      { hour: '5pm', duration: '6pm', title: 'Private Yoga' }
    ]
  },
  {
    title: dates[3],
    data: [{ hour: '12pm', duration: '2pm', title: 'Ashtanga Yoga' }]
  },
  {
    title: dates[4],
    data: [{}]
  },
  {
    title: dates[5],
    data: [
      { hour: '6pm', duration: '7pm', title: 'Middle Yoga' },
      { hour: '9pm', duration: '10pm', title: 'Ashtanga' },
      { hour: '10pm', duration: '11pm', title: 'TRX' },
      { hour: '11pm', duration: '12am', title: 'Running Group' }
    ]
  },
  {
    title: dates[6],
    data: [
      { hour: '8am', duration: '10am', title: 'Ashtanga Yoga' }
    ]
  },
  {
    title: dates[7],
    data: [{}]
  },
  {
    title: dates[8],
    data: [
      { hour: '6pm', duration: '7pm', title: 'Middle Yoga' },
      { hour: '9pm', duration: '10pm', title: 'Ashtanga' },
      { hour: '10pm', duration: '11pm', title: 'TRX' },
      { hour: '11pm', duration: '12am', title: 'Running Group' }
    ]
  },

];

export function getMarkedDates() {
  const marked: MarkedDates = {};

  agendaItems.forEach(item => {
    // NOTE: only mark dates with data
    if (item.data && item.data.length > 0 && !isEmpty(item.data[0])) {
      marked[item.title] = { marked: true };
    } else {
      marked[item.title] = { disabled: false };
    }
  });
  return marked;
}
