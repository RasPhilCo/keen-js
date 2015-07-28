function DataTypeParser() {}

DataTypeParser.metric = function(response) {
  var dataType, schema, dataset;
  dataType = 'singular';
  schema = {
    records: '',
    select: [{
      path: 'result',
      type: 'string',
      label: 'Metric'
    }]
  };
  return dataType, schema, dataset;
}

DataTypeParser.selectUnique = function(response) {
  var dataType, schema, dataset;
  dataType = 'nominal';
  dataset = new Dataset();
  dataset.appendColumn('unique values', []);
  each(response.result, function(result, i){
    dataset.appendRow(result);
  });
  return dataType, schema, dataset;
}
