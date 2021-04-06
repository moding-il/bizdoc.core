/** k6
 * https://k6.io/docs/
 * 
 * command-line > k6 run [--iterations 10] [--vus 10] [-e TESTS=...] [-e FORMS=...] .\tests.js --out=csv 
 */
 import http from 'k6/http';
 import { group, check, sleep } from 'k6';
 
 const BASE_URL = __ENV.HOSTNAME ? `https://${__ENV.HOSTNAME}` : 'https://localhost';
 const TESTS = __ENV.TESTS ? __ENV.TESTS.split(',') :
   ['G02' /* refresh */,
     'G03' /* dashboard */,
     'G04' /* inbox */,
     'P02' /* compose */,
     'G05' /* message */,
     'U01' /* update */,
     'U02' /* submit */,
     'U03' /* approve */];
 const APPROVE = 'approve', FORMS = __ENV.FORMS ? __ENV.FORMS.split(',') : [],
   JSON_HEADERS = {
     'Content-Type': 'application/json',
     accept: 'application/json, text/plain, */*',
     'accept-encoding': 'gzip, deflate, br'
   };
 
 export let options = {
   //duration: '60s',
   //httpDebug: 'full',
   iterations: 100,
   vus: 1
 };
 
 export default function () {
   // sign in
   {
     let username = `user${__VU}`;
     let payload = {
       username: username,
       password: `${username}!`
     };
     let res = http.post(`${BASE_URL}/api/account/login`,
       JSON.stringify(payload),
       {
         headers: JSON_HEADERS,
         tags: { name: 'P01' }
       });
     ok(res, 'P01');
     if (res.status === 200 && !FORMS.length) {
       let body = res.json();
       body.forms.forEach(f => FORMS.push(f.name));
     }
 
     sleep(1);
   }
 
   // refresh
   if (TESTS.indexOf('G02') > -1) {
     let res = http.get(`${BASE_URL}/api/account/refresh`,
       {
         headers: JSON_HEADERS,
         tags: { name: 'G02' }
       });
     ok(res, 'G02');
     sleep(1);
   }
   // dashboard
   if (TESTS.indexOf('G03') > -1)
     group('G03', () => {
       get('dashboard/recents', 'G03');
       get('dashboard/personalScore', 'G03');
       get('dashboard/periods', 'G03');
       get('dashboard/personalActivity', 'G03');
       get('dashboard/cubeAnalysis', 'G03');
       get('dashboard/departmentalPerformance', 'G03');
       get('dashboard/pendingResults', 'G03');
       get('dashboard/cube-documents', 'G03');
     });
   // inbox
   if (TESTS.indexOf('G04') > -1)
     get('mail', 'G04');
   // compose
   if (['P02', 'U02', 'G05', 'U01'].find(t => TESTS.indexOf(t) > -1))
     FORMS.forEach(f => {
       let res = http.post(`${BASE_URL}/api/mail?form=${f}`,
         null,
         {
           headers: JSON_HEADERS,
           tags: { name: 'P02' }
         });
       ok(res, 'P02');
       sleep(1);
       if (res.status == 200) {
         let body = JSON.parse(res.body);
         let recipientId = body.id, version = 0;
         // message
         if (TESTS.indexOf('G05') > -1)
           get(`mail/${recipientId}?version=${version}`, 'G05');
         // update
         if (TESTS.indexOf('U01') > -1) {
           let payload = {
             'due': '0001-01-01T00:00:00',
             'field1': '02bed0c2-b715-4e35-9c94-24a193856d74',
             'lines': [],
             'quarter': '1',
             'subject': 'A',
             'year': '2020'
           };
           let res = http.put(`${BASE_URL}/api/mail/${recipientId}?version=${version}`,
             JSON.stringify(payload),
             {
               headers: JSON_HEADERS,
               tags: { name: 'U01' }
             });
           ok(res, 'U01');
           let body = res.json();
           version = body.version;
           sleep(5);
         }
         // submit
         if (TESTS.indexOf('U02') > -1) {
           let res = http.put(`${BASE_URL}/api/mail/${recipientId}?version=${version}&go=true`,
             null,
             {
               headers: JSON_HEADERS,
               tags: { name: 'U02' }
             });
           ok(res, 'U02');
           let body = res.json();
           version = body.version;
           // next signer
           recipientId = body.recipients[1].id;
           sleep(1);
         }
         // approve
         if (TESTS.indexOf('U03') > -1) {
           let res = http.put(`${BASE_URL}/api/mail/${recipientId}?version=${version}&action=${APPROVE}`,
             null,
             {
               headers: JSON_HEADERS,
               tags: { name: 'U03' }
             });
           ok(res, 'U03')
           sleep(1);
         }
       }
     });
 }
 function get(url, tag) {
   let res = http.get(`${BASE_URL}/api/${url}`,
     {
       headers: JSON_HEADERS,
       tags: { name: tag }
     });
   ok(res, tag);
   sleep(1);
 }
 function ok(res, tag) {
   const tests = {};
   tests['200 ' + tag] = r => r.status === 200 || r.status == 401 /* ignore */;
   check(res, tests)
 }