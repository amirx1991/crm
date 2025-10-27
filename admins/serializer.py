from rest_framework import serializers
from persiantools.jdatetime import JalaliDate, JalaliDateTime
from django.contrib.auth.hashers import make_password

from .models import Admin
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):

        data = super().validate(attrs) 

        
        user = self.user  # the authenticated user from super's validate

        # Proceed with token generation
        data.update({'data':{
            
            'displayName': user.first_name + '' + user.last_name,
            'photoURL': user.is_staff,
            'email': user.first_name,
            'last_name': user.last_name,
            'type_user': user.type_user,
          
            #'weight':user.weight
        }})
        return data
from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Admin  # Ensure to import your Admin model

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Admin  # Ensure to import your Admin model

class UserSerializer(serializers.ModelSerializer):
    img2 = serializers.SerializerMethodField()
    phone2 = serializers.SerializerMethodField()

    class Meta:
        model = Admin
        fields = ['id', 'first_name', 'username', 'last_name', 'phone', 'img2', 'password', 'type_user', 'img', 'phone2', 'address', 'device_id']
        extra_kwargs = {'password': {'write_only': True}}  # Password should not be exposed

    def get_img2(self, obj):
        """Return the image URL with '/api' prefix."""
        return f'/api{obj.img.url}' if obj.img else None  # Handle cases where img might be None
    
    def get_phone2(self, obj):
        """Return the phone number without the country code."""
        return str(obj.phone).split('+98')[1] if str(obj.phone).startswith('+98') else obj.phone

    def create(self, validated_data):
        """Hash the password before saving."""
        password = validated_data.pop('password', None)  # Remove password from validated_data
        if password and password != 'undefined':  # Check for valid password
            validated_data['password'] = make_password(password)  # Hash the password
        
        # Set default values for phone and img if they are not provided
        validated_data.setdefault('phone', None)
        img = validated_data.pop('img', None)  # Remove img if it exists
        if img is not None:  # Check if img is provided
            validated_data['img'] = img  # Assign the image to validated         
        user = Admin(**validated_data)  # Create user instance
        user.save()  # Save the user instance to the database
        return user

    def update(self, instance, validated_data):
        """Update user instance with provided data."""
        
        # Update fields if they exist in validated_data
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)


        # Update phone number with country code if provided
        phone = validated_data.get('phone')
        if phone:
            instance.phone =  str(phone)
        # Handle password update if provided and valid
        if 'password' in validated_data and validated_data['password'] != 'undefined':
            instance.password = make_password(validated_data['password'])  # Hash new password

        # Handle image update if provided
        if 'img' in validated_data:
            instance.img = validated_data['img']  # Assuming img is a file upload or a valid image field
        
        
        instance.save()  # Save the updated user instance to the database
        return instance

    



    

