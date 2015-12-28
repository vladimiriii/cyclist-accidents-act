#!/usr/local/bin/python3.1
# -*- coding: utf-8 -*-
import pandas as pd
import re
import os, shutil
import json


######################################################
# Script                                             #
######################################################

# Import data
filepath = "./Cyclist_Crashes.csv"

print("Reading in data...")
data = pd.read_csv(filepath, header=0, index_col=0)


# Create JSON data
records = data.index.values
features = []
locations = []

for record in records:
    
    # Make Markers JSON
    single_point = {}
    single_point["type"] = "Feature"
    
    properties = {}
    properties["description"] = data.loc[record, 'CRASH_TYPE']
    
    if data.loc[record, 'SEVERITY'] == 'Injury':
        properties["marker-color"] = "#FF0000"
        properties["marker-size"] = "medium"
        properties["marker-symbol"] = "hospital"
    elif data.loc[record, 'SEVERITY'] == 'Fatal':
        properties["marker-color"] = "#2A0A0A"
        properties["marker-size"] = "large"
        properties["marker-symbol"] = "cemetery"
    else:
        properties["marker-color"] = "#0040FF"
        properties["marker-size"] = "small"
        properties["marker-symbol"] = "bicycle"
    single_point["properties"] = properties
    
    geometry = {}
    geometry["type"] = "Point"
    geometry["coordinates"] = [data.loc[record, 'LONGITUDE'], data.loc[record, 'LATITUDE']]
    single_point["geometry"] = geometry
    
    features.append(single_point)
    
    # Make locations JSON
    addresses = [data.loc[record, 'LATITUDE'], data.loc[record, 'LONGITUDE'], 1]
    locations.append(addresses)

markers = {}
markers["type"] = "FeatureCollection"
markers["features"] = features

output_file = 'data.js'
with open(output_file, 'w') as data_file:
    data_file.write("var markers = "
                     + json.dumps(obj = markers, indent = 4, sort_keys = True)
                     + ";")
                     
output_file = 'locations.js'
with open(output_file, 'w') as data_file:
    data_file.write("var locations = "
                     + json.dumps(obj = locations, indent = 4, sort_keys = True)
                     + ";")

   
# Output Results
#output_filepath = "results2.csv"
#data.to_csv(path_or_buf = output_filepath, force_ascii = False, encoding='utf-8')

#print(data.loc[0:3 , :])
#print(words)
#print(categories)
#print(clean_description("person i dyshimte me arme zjarri ne lokalin “vera” afer qerdhes se femijeve podujeve."))

