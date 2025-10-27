
from os import environ
from xml.etree import ElementTree as ET
import xmltodict
import requests
from bs4 import BeautifulSoup
import requests
from xml import etree

from requests.structures import CaseInsensitiveDict

from zeep import Client
from zeep.transports import Transport
import time

from kavenegar import *
from celery import shared_task


class SmartSms():
    
    def send_sms(mobile, template, tokens):
        try:
            api = KavenegarAPI('4C4249786F6A6144356430314E66624E7A692F697357474C49577172527677454D394877634B3646335A303D')
            params = {
                'receptor': mobile,
                'template': template,
                'type': 'sms',#sms vs call
            }  
            params.update(tokens)

            print("$$$$$$$",params)
 
            response = api.verify_lookup(params)
        except APIException as e: 
            print(e)
        except HTTPException as e: 
            print(e)

    @shared_task()
    def send_background(mobile, template, tokens):
        try:
            api = KavenegarAPI('68306338786A3652424D61396E673373546855364377475A3139363144453367427971316A6838795133593D')
            params = {
                'receptor': mobile,
                'template': template,
                'type': 'sms',
            } 
            print("tesssssssssssssst")
            params.update(tokens)
            response = api.verify_lookup(params)
            print('response >>>>>>>>>>>>>>>>>>>', response)
            return response
        except APIException as e: 
            return e
        except HTTPException as e: 
            return e

    def sendOneToMany(self, mobiles, template, tokens):
        try:
            print('mobiles>>>>>>>>>>>>>>>>>>>>>', mobiles)
            smaert = SmartSms()
            clean_mobiles = []
            for mobile in mobiles:
                if not (mobile in clean_mobiles):
                    clean_mobiles.append(mobile)

            print('clean_mobiles>>>>>>>>>>>>>>>>>>.', clean_mobiles)
            
            for item in clean_mobiles:
                print('item>>>>>>>>>>>>>>>>', item, template, tokens)
                smaert.send_background.delay(item, template, tokens)

            return clean_mobiles

        except APIException as e: 
            return e
        except HTTPException as e: 
            return e
