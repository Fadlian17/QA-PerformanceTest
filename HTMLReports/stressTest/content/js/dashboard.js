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

    var data = {"OkPercent": 0.05417890444552169, "KoPercent": 99.94582109555448};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Get User Profile"], "isController": false}, {"data": [0.0, 500, 1500, "Add Contact"], "isController": false}, {"data": [0.0, 500, 1500, "Update Contact"], "isController": false}, {"data": [0.0, 500, 1500, "Delete Contact"], "isController": false}, {"data": [0.0, 500, 1500, "Get Contact List"], "isController": false}, {"data": [0.0, 500, 1500, "Login"], "isController": false}, {"data": [0.0, 500, 1500, "Get Single Contact"], "isController": false}, {"data": [0.0, 500, 1500, "Update Partial Contact "], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 70138, 70100, 99.94582109555448, 1167.913855541921, 0, 31555, 1148.0, 1560.0, 1594.0, 1778.9800000000032, 232.9438647067029, 376.8688879137412, 55.00359340646111], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get User Profile", 7977, 7941, 99.54870251974427, 145.31252350507611, 0, 30263, 1.0, 3.0, 9.0, 1560.2200000000003, 27.125917714309033, 54.75492253942899, 0.3466334783370116], "isController": false}, {"data": ["Add Contact", 8957, 8957, 100.0, 2194.56961036061, 0, 31291, 1265.0, 1566.0, 1709.1000000000004, 31022.42, 30.971538825937667, 39.08918991462685, 18.660410493048087], "isController": false}, {"data": ["Update Contact", 8821, 8821, 100.0, 182.01303707062723, 0, 31045, 1.0, 8.0, 1249.0, 1550.7800000000007, 38.80876749936206, 76.77607079102395, 2.155170932250741], "isController": false}, {"data": ["Delete Contact", 8760, 8760, 100.0, 153.12773972602693, 0, 31040, 1.0, 8.0, 1247.0, 1538.0, 44.64968347655891, 88.33220203918061, 1.431066197551913], "isController": false}, {"data": ["Get Contact List", 8869, 8869, 100.0, 190.14894576615222, 0, 31041, 1.0, 8.0, 1252.5, 1557.2999999999993, 34.34614907986864, 67.9313574103782, 1.0179093841490334], "isController": false}, {"data": ["Login", 9078, 9076, 99.97796871557613, 2368.6360431813073, 0, 31262, 1267.0, 1591.0, 6544.049999999999, 31038.0, 30.15005280742891, 37.925575022874916, 12.094469719174079], "isController": false}, {"data": ["Get Single Contact", 8860, 8860, 100.0, 2125.138487584654, 0, 31555, 1262.0, 1554.9000000000005, 1659.0, 31023.0, 34.29934111197999, 43.320312348779005, 11.313749932252993], "isController": false}, {"data": ["Update Partial Contact ", 8816, 8816, 100.0, 1830.1556261343, 0, 31525, 1262.0, 1567.0, 1672.7499999999982, 31000.0, 38.79206030018085, 48.993819591728524, 15.247365868509172], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["503/Service Unavailable", 35196, 50.208273894436516, 50.18107160169951], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 34862, 49.73181169757489, 49.70486754683624], "isController": false}, {"data": ["401/Unauthorized", 42, 0.05991440798858773, 0.0598819470187345], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 70138, 70100, "503/Service Unavailable", 35196, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 34862, "401/Unauthorized", 42, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get User Profile", 7977, 7941, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 7701, "503/Service Unavailable", 240, "", "", "", "", "", ""], "isController": false}, {"data": ["Add Contact", 8957, 8957, "503/Service Unavailable", 8225, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 732, "", "", "", "", "", ""], "isController": false}, {"data": ["Update Contact", 8821, 8821, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 8086, "503/Service Unavailable", 735, "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Contact", 8760, 8760, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 8030, "503/Service Unavailable", 730, "", "", "", "", "", ""], "isController": false}, {"data": ["Get Contact List", 8869, 8869, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 8125, "503/Service Unavailable", 744, "", "", "", "", "", ""], "isController": false}, {"data": ["Login", 9078, 9076, "503/Service Unavailable", 8311, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 723, "401/Unauthorized", 42, "", "", "", ""], "isController": false}, {"data": ["Get Single Contact", 8860, 8860, "503/Service Unavailable", 8125, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 735, "", "", "", "", "", ""], "isController": false}, {"data": ["Update Partial Contact ", 8816, 8816, "503/Service Unavailable", 8086, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 730, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
