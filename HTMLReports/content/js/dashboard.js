/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 1.933716305788776, "KoPercent": 98.06628369421122};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.005475033141847106, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.024575056317837397, 500, 1500, "Get User Profile"], "isController": false}, {"data": [0.00725937066173068, 500, 1500, "Add Contact"], "isController": false}, {"data": [0.004606413994169096, 500, 1500, "Update Contact"], "isController": false}, {"data": [0.0029059528002817895, 500, 1500, "Delete Contact"], "isController": false}, {"data": [9.74089226573154E-5, 500, 1500, "Get Contact List"], "isController": false}, {"data": [0.004493605254061528, 500, 1500, "Login"], "isController": false}, {"data": [0.006243103548405831, 500, 1500, "Get Single Contact"], "isController": false}, {"data": [0.003482587064676617, 500, 1500, "Update Partial Contact "], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 113150, 110962, 98.06628369421122, 1193.8571542200743, 0, 35318, 996.5, 1188.0, 1213.0, 1277.9900000000016, 188.27017727180456, 376.9111050494344, 53.35906834860515], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get User Profile", 4883, 4569, 93.56952693016588, 1163.609256604548, 0, 25294, 1125.0, 2138.800000000003, 3111.4000000000024, 11316.479999999952, 8.157803290520041, 12.490970637421313, 1.9283311247636026], "isController": false}, {"data": ["Add Contact", 17288, 16752, 96.8995835261453, 1202.2836071263257, 0, 27160, 1082.5, 2311.0, 3224.5499999999993, 14318.360000000044, 28.938104795175196, 46.05719329111519, 11.545303589183696], "isController": false}, {"data": ["Update Contact", 17150, 16924, 98.68221574344024, 1191.5722448979536, 0, 27527, 1133.0, 2301.7999999999993, 3386.3499999999967, 10214.25000000004, 29.08470517605998, 45.5311175607175, 11.670791107160603], "isController": false}, {"data": ["Delete Contact", 17034, 16891, 99.16050252436304, 1193.8234707056447, 0, 26953, 1132.0, 2268.5, 3090.75, 12656.700000000055, 29.128952989077927, 45.66902891947214, 7.09208561589079], "isController": false}, {"data": ["Get Contact List", 5133, 4837, 94.23339177868692, 1745.1638418079137, 0, 35318, 1138.0, 2834.600000000002, 6521.600000000024, 25344.099999999988, 8.622630162575131, 90.29773884574261, 2.0256961528673227], "isController": false}, {"data": ["Login", 17358, 17158, 98.84779352459961, 1226.9566770365316, 0, 28206, 6.0, 2371.0, 3532.2499999999964, 19466.87, 28.885275964381815, 46.886424368561016, 6.996083420940744], "isController": false}, {"data": ["Get Single Contact", 17219, 16900, 98.14739531912423, 1078.8362854985787, 0, 27671, 5.0, 2235.0, 3109.0, 9853.199999999993, 29.095585054612307, 47.56734837090323, 5.9412298968795625], "isController": false}, {"data": ["Update Partial Contact ", 17085, 16931, 99.09862452443664, 1112.963359672238, 0, 30281, 4.0, 2244.0, 3131.0, 12214.51999999999, 29.077930897152456, 47.47961680763124, 6.913303400701037], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 925, 0.8336187163172978, 0.8174988952717631], "isController": false}, {"data": ["503/Service Unavailable", 55036, 49.598961806744654, 48.639858594785686], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, 0.0036048376921829096, 0.003535130357931949], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 54569, 49.1780970061823, 48.22713212549713], "isController": false}, {"data": ["401/Unauthorized", 428, 0.3857176330635713, 0.37825894829871853], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 113150, 110962, "503/Service Unavailable", 55036, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 54569, "400/Bad Request", 925, "401/Unauthorized", 428, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get User Profile", 4883, 4569, "503/Service Unavailable", 2513, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 2056, "", "", "", "", "", ""], "isController": false}, {"data": ["Add Contact", 17288, 16752, "503/Service Unavailable", 8617, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 8135, "", "", "", "", "", ""], "isController": false}, {"data": ["Update Contact", 17150, 16924, "503/Service Unavailable", 9018, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 7632, "400/Bad Request", 272, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2, "", ""], "isController": false}, {"data": ["Delete Contact", 17034, 16891, "503/Service Unavailable", 9061, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 7631, "400/Bad Request", 199, "", "", "", ""], "isController": false}, {"data": ["Get Contact List", 5133, 4837, "503/Service Unavailable", 2661, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 2176, "", "", "", "", "", ""], "isController": false}, {"data": ["Login", 17358, 17158, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 8974, "503/Service Unavailable", 7756, "401/Unauthorized", 428, "", "", "", ""], "isController": false}, {"data": ["Get Single Contact", 17219, 16900, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 9022, "503/Service Unavailable", 7710, "400/Bad Request", 167, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", ""], "isController": false}, {"data": ["Update Partial Contact ", 17085, 16931, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 8943, "503/Service Unavailable", 7700, "400/Bad Request", 287, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
