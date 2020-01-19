from pyproj import Transformer, transform

'''
EPSG:3825 --> 澎湖 TM2, TWD97 二度分帶 (X 原點在東經 118 度)
EPSG:3826 --> 台灣本島 TM2, TWD97 二度分帶 (X 原點在東經 120 度)
EPSG:4326 --> WGS84 經緯度
'''

# transformer = Transformer.from_crs(3826, 4326)
x_coords = 184505.81
y_coords = 2503187.85

a = transform(3826, 4326, x_coords, y_coords)
# b = transformer(3826, 4326, x_coords, y_coords)

print(a)
# print(b)
