#!/usr/bin/env python3
import urllib.request
import urllib.parse
import json

def test_job_creation():
    data = json.dumps({
        'job_type': 'text_generation',
        'input_data': {'prompt': 'test job processing'}
    }).encode('utf-8')
    
    req = urllib.request.Request(
        'http://localhost:8010/api/v1/jobs/',
        data=data,
        headers={
            'Content-Type': 'application/json',
            'Authorization': 'Bearer change-me-dev-token'
        },
        method='POST'
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            print(f'Status: {response.status}')
            response_text = response.read().decode()
            print(f'Response: {response_text}')
            return response.status == 201
    except urllib.error.HTTPError as e:
        print(f'HTTP Error {e.code}: {e.read().decode()}')
        return False
    except Exception as e:
        print(f'Error: {e}')
        return False

if __name__ == '__main__':
    test_job_creation()
