import utm
import csv
import os
import json
from pyproj import Transformer, transform

# utm.to_latlon(340000, 5710000, 32, 'U')
# # >>> (51.51852098408468, 6.693872395145327)
# print(utm.to_latlon(98613.21, 2598964.109, 49, None , True, False))


script_dir = os.path.dirname(__file__)
file_path = os.path.join(script_dir, './PoliceAddress1_1081230.csv')
output_file_path = os.path.join(script_dir, './police.json')


data = []
with open(file_path, newline='') as csvfile:
    # 以冒號分隔欄位，讀取檔案內容
    myCsv = csv.reader(csvfile, delimiter=',')
    # 跳過header
    headers = next(myCsv)
    # for row in myCsv:
    for idx, row in enumerate(myCsv):
        # print(row)
        utm_coordinates_list = list(map(float, row[-2:]))
        # 轉出來有片差。要提供zon_letter，但是台灣橫跨三區。改用pyproj轉
        # latlon = utm.to_latlon(
        #     utm_coordinates_list[0], utm_coordinates_list[1], 51, None, True, False)
        '''
        EPSG:3825 --> 澎湖 TM2, TWD97 二度分帶 (X 原點在東經 118 度)
        EPSG:3826 --> 台灣本島 TM2, TWD97 二度分帶 (X 原點在東經 120 度)
        EPSG:4326 --> WGS84 經緯度
        '''
        latlon = transform(
            3826, 4326, utm_coordinates_list[0], utm_coordinates_list[1])
        # print(latlon[0])
        # print(latlon[1])
        data.append({
            'id': idx,
            'name': row[0],
            'name_en': row[1],
            'zip_code': row[2],
            'address': row[3],
            'number': row[4],
            'lat': latlon[0],
            'lon': latlon[1],
        })
        # break

# print(data)

with open(output_file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
