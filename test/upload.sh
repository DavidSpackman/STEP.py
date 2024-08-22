#!/usr/bin/env bash

config='406608'
step='schema.step.xml'

rm -f .cache.json
rm -f ${step}

../STEP/Converter.py -p XSD -r EDDO xsd2step -s schema.xsd  -o ${step} -x data.xml

if [ -e "${step}" ]
then
    open "${step}"
fi

exit

id=$(./import.sh  -i ${config} ${step} | pyson.py -tp '$.id')

echo $id

if [ ! -z "$id" ]
then
    ./report.sh -i $id
fi



