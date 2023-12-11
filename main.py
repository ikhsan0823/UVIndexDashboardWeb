from flask import Flask, render_template, request, redirect, url_for
import requests
from datetime import datetime, timedelta, timezone
import geocoder

app = Flask(__name__)

GEOTIMEZONE_API_URL = 'https://api.geotimezone.com/public/timezone'

@app.route('/', methods=['GET', 'POST'])
def index():
    current_uv_index = None
    forecast_uv_index = []
    location_info = None

    if request.method == 'POST':
        address = request.form['address']
        firstlatitude = request.form['latitude']
        firstlongitude = request.form['longitude']

        if not (address or (firstlatitude and firstlongitude)):
            return redirect(url_for('login'))
        location = None
        if address:
            location = geocoder.osm(address)
            latitude, longitude = location.latlng
        elif firstlatitude and firstlongitude:
            latitude = firstlatitude
            longitude = firstlongitude

        # Use geotimezone API to get timezone information
        timezone_response = requests.get(GEOTIMEZONE_API_URL, params={'latitude': latitude, 'longitude': longitude})
        timezone_data = timezone_response.json()

        # Extract timezone from API response
        timezone = timezone_data.get('timezone', 'UTC')

        # Get location information
        location_info = {
            'address': location.address if location else '',
            'latitude': latitude,
            'longitude': longitude,
            'local_time': get_local_time(latitude, longitude),
        }

        # Call UV Index API using obtained latitude and longitude
        api_url = f'https://currentuvindex.com/api/v1/uvi?latitude={latitude}&longitude={longitude}'
        response = requests.get(api_url)
        uv_index_data = response.json()

        # Get current UV Index using local time
        current_uv_index_data = uv_index_data.get('now', {})
        current_uv_index = current_uv_index_data.get('uvi', 'Data not available')

        # Get UV Index forecast for the next hour using local time
        forecast_time_str = location_info['local_time']
        forecast_time = datetime.strptime(forecast_time_str, '%Y-%m-%d %H:%M:%S')

        forecast_time += timedelta(hours=1)

        for forecast_data in uv_index_data.get('forecast', []):
            forecast_uv = forecast_data.get('uvi', '')

            # Get forecast date and hour separately
            forecast_date, forecast_hour = forecast_time.strftime('%Y-%m-%d %H:00').split(' ')

            # Add forecast date, hour, and UV Index to the list
            forecast_uv_index.append({'date': forecast_date, 'hour': forecast_hour, 'uvi': forecast_uv})

            # Add one hour to the forecast time
            forecast_time += timedelta(hours=1)

        # Sorting data berdasarkan tanggal dan jam
        forecast_uv_index.sort(key=lambda x: (x['date'], x['hour']))

        # Menyimpan kelompok data berdasarkan tanggal
        grouped_data = {}
        for forecast_data in forecast_uv_index:
            if forecast_data['date'] not in grouped_data:
                grouped_data[forecast_data['date']] = []
            grouped_data[forecast_data['date']].append({'hour': forecast_data['hour'], 'uvi': forecast_data['uvi']})
        
        max_uvi_per_group = {} #Mendapatkan nilai maximum

        for date, data_list in grouped_data.items():
            max_uvi = max(data_list, key=lambda x: x['uvi'])
            max_uvi_per_group[date] = {'hour': max_uvi['hour'], 'uvi': max_uvi['uvi']}

        print(max_uvi_per_group)


        return render_template('dashboard.html', current_uv_index=current_uv_index, location_info=location_info, max_uvi_per_group=max_uvi_per_group)

    return redirect(url_for('login'))

@app.route('/login', methods=['GET'])
def login():
    return render_template('login.html')

def get_local_time(latitude, longitude):
    # Call API to get timezone information
    api_url = f'https://api.geotimezone.com/public/timezone?latitude={latitude}&longitude={longitude}'
    response = requests.get(api_url)
    timezone_info = response.json()

    # Get time difference in hours from API response
    offset_str = timezone_info.get('offset', 'UTC+0')  # Default value 'UTC+0' if not present

    # Extract numeric part from offset_str
    offset_hours_str = ''.join(char for char in offset_str if char.isdigit() or char in ['-', '+'])

    try:
        # Convert to numeric data type
        offset_hours = int(offset_hours_str) if offset_hours_str else 0
    except ValueError:
        # Handle cases where offset_hours_str is not a valid integer (e.g., 'UTC+8')
        offset_hours = 0

    # Get current UTC time
    utc_time = datetime.now(timezone.utc)

    # Convert UTC time to local time by applying the time difference
    local_time = utc_time + timedelta(hours=offset_hours)

    return local_time.strftime('%Y-%m-%d %H:%M:%S')

if __name__ == '__main__':
    app.run(debug=True)
