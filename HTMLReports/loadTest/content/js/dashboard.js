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

    var data = {"OkPercent": 0.07808229874287499, "KoPercent": 99.92191770125713};
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 51228, 51188, 99.92191770125713, 1648.7310064808207, 0, 37303, 1024.0, 1314.0, 1361.0, 35208.0, 155.52573576290433, 251.3952866564608, 36.91366877500865], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get User Profile", 5891, 5856, 99.40587336615175, 357.5542352741471, 0, 36271, 1.0, 4.0, 1013.7999999999993, 16057.72, 18.267119804522284, 36.61699057166534, 0.350553754046612], "isController": false}, {"data": ["Add Contact", 6575, 6573, 99.96958174904942, 3220.790570342202, 0, 37262, 1243.0, 1357.0, 31016.0, 31262.399999999998, 20.79814255980059, 26.40690068333365, 12.432577171587049], "isController": false}, {"data": ["Update Contact", 6398, 6398, 100.0, 276.7221006564562, 0, 31153, 1.0, 11.100000000000364, 1238.0, 1338.0, 27.309668937492532, 53.78264695674119, 1.7308602820498045], "isController": false}, {"data": ["Delete Contact", 6366, 6366, 100.0, 391.9065347156774, 0, 36297, 1.0, 43.30000000000018, 1248.6499999999996, 11257.72999999979, 28.31233405529933, 55.636991380882286, 1.0959829221499762], "isController": false}, {"data": ["Get Contact List", 6471, 6471, 100.0, 311.86277236903237, 0, 36083, 1.0, 12.0, 1244.0, 1465.9199999999964, 23.638356164383563, 46.57239583333333, 0.7940318207762557], "isController": false}, {"data": ["Login", 6673, 6670, 99.95504270942604, 3432.8404016184654, 0, 37296, 1243.0, 1544.800000000001, 31201.3, 35226.26, 21.651033234157563, 27.438016875630666, 8.5839066510089], "isController": false}, {"data": ["Get Single Contact", 6460, 6460, 100.0, 2713.5708978328225, 0, 37303, 1237.0, 1339.0, 23255.64999999998, 31152.0, 24.295213166049884, 30.86581475346564, 7.9508331323619], "isController": false}, {"data": ["Update Partial Contact ", 6394, 6394, 100.0, 2261.138723803567, 0, 36329, 1238.0, 1342.0, 8179.5, 31158.1, 27.223570485800657, 34.599983168880655, 10.586383225294844], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 45, 0.08791122919434242, 0.08784258608573436], "isController": false}, {"data": ["503/Service Unavailable", 25715, 50.23638352738923, 50.19715780432576], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 25381, 49.58388684848011, 49.545170609822755], "isController": false}, {"data": ["401/Unauthorized", 47, 0.0918183949363132, 0.09174670102287812], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 51228, 51188, "503/Service Unavailable", 25715, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 25381, "401/Unauthorized", 47, "400/Bad Request", 45, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get User Profile", 5891, 5856, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 5594, "503/Service Unavailable", 262, "", "", "", "", "", ""], "isController": false}, {"data": ["Add Contact", 6575, 6573, "503/Service Unavailable", 5985, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 588, "", "", "", "", "", ""], "isController": false}, {"data": ["Update Contact", 6398, 6398, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 5797, "503/Service Unavailable", 601, "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Contact", 6366, 6366, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 5738, "503/Service Unavailable", 626, "400/Bad Request", 2, "", "", "", ""], "isController": false}, {"data": ["Get Contact List", 6471, 6471, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 5870, "503/Service Unavailable", 601, "", "", "", "", "", ""], "isController": false}, {"data": ["Login", 6673, 6670, "503/Service Unavailable", 6015, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 608, "401/Unauthorized", 47, "", "", "", ""], "isController": false}, {"data": ["Get Single Contact", 6460, 6460, "503/Service Unavailable", 5859, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 589, "400/Bad Request", 12, "", "", "", ""], "isController": false}, {"data": ["Update Partial Contact ", 6394, 6394, "503/Service Unavailable", 5766, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 597, "400/Bad Request", 31, "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
