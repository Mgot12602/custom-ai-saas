#!/usr/bin/env python3
import asyncio
import aiohttp
import json

async def test_job_creation():
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                'http://localhost:8010/api/v1/jobs/',
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer change-me-dev-token'
                },
                json={'prompt': 'test job processing'}
            ) as response:
                print(f'Status: {response.status}')
                text = await response.text()
                print(f'Response: {text}')
                return response.status == 201
        except Exception as e:
            print(f'Error: {e}')
            return False

if __name__ == '__main__':
    asyncio.run(test_job_creation())
