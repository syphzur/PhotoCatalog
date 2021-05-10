import { EditableImageDataProperty } from './EditableImageDataProperty';
import { ImageData } from './ImageData';
import { FormControl } from '@angular/forms';
import dayjs from 'dayjs';
import { ImageDataValidators } from './ImageDataValidators';
import { CoordinatesService } from '../service/coordinates.service';

export class ImageDataFacade {
    imageDataValues: EditableImageDataProperty<string | number | Date | null>[];

    constructor(public imageData: ImageData, private coordinatesService: CoordinatesService) {
        this.imageDataValues = [
            {
                inputType: 'datetime-local',
                propertyName: 'Date and time',
                setter: (value) => (this.imageData.dateTimeOriginal = new Date(value as string)),
                formControl: new FormControl(ImageDataFacade.extractDateForInput(this.imageData.dateTimeOriginal), [
                    ImageDataValidators.date,
                ]),
            },
            {
                inputType: 'number',
                propertyName: 'Focal length',
                step: 0.0001,
                unit: 'mm',
                setter: (value) => (this.imageData.focalLength = value as string),
                formControl: new FormControl(this.imageData.focalLength, [ImageDataValidators.nonNegative]),
            },
            {
                inputType: 'number',
                propertyName: 'F number',
                step: 0.0001,
                setter: (value) => (this.imageData.focalLength = value as string),
                formControl: new FormControl(this.imageData.fNumber, [ImageDataValidators.nonNegative]),
            },
            {
                inputType: 'number',
                propertyName: 'Exposure time',
                step: 0.0001,
                setter: (value) => (this.imageData.focalLength = value as string),
                formControl: new FormControl(this.imageData.exposureTime, [ImageDataValidators.nonNegative]),
            },
            {
                inputType: 'number',
                propertyName: 'X dimension',
                unit: 'px',
                step: 1,
                setter: (value) => (this.imageData.pixelXDimension = Number.parseInt(value as string)),
                formControl: new FormControl(this.imageData.pixelXDimension, [
                    ImageDataValidators.nonNegative,
                    ImageDataValidators.max(ImageDataValidators.LONG_MAX_VAL),
                ]),
            },
            {
                inputType: 'number',
                unit: 'px',
                propertyName: 'Y dimension',
                step: 1,
                setter: (value) => (this.imageData.pixelYDimension = Number.parseInt(value as string)),
                formControl: new FormControl(this.imageData.pixelYDimension, [
                    ImageDataValidators.nonNegative,
                    ImageDataValidators.max(ImageDataValidators.LONG_MAX_VAL),
                ]),
            },
            {
                inputType: 'number',
                propertyName: 'Iso speed rating',
                step: 1,
                setter: (value) => (this.imageData.isoSpeedRatings = Number.parseInt(value as string)),
                formControl: new FormControl(this.imageData.isoSpeedRatings, [
                    ImageDataValidators.nonNegative,
                    ImageDataValidators.max(ImageDataValidators.LONG_MAX_VAL),
                ]),
            },
            {
                inputType: 'text',
                setter: (value) => (this.imageData.cameraMake = value as string),
                propertyName: 'Camera manufacturer',
                formControl: new FormControl(this.imageData.cameraMake, [
                    ImageDataValidators.maxChars(ImageDataValidators.ASCII_MAX_CHARS),
                ]),
            },
            {
                inputType: 'text',
                propertyName: 'Camera model',
                setter: (value) => (this.imageData.cameraModel = value as string),
                formControl: new FormControl(this.imageData.cameraModel, [
                    ImageDataValidators.maxChars(ImageDataValidators.ASCII_MAX_CHARS),
                ]),
            },
            {
                inputType: 'text',
                propertyName: 'Software',
                setter: (value) => (this.imageData.editingSoftware = value as string),
                formControl: new FormControl(this.imageData.editingSoftware, [
                    ImageDataValidators.maxChars(ImageDataValidators.ASCII_MAX_CHARS),
                ]),
            },
            {
                inputType: 'number',
                step: 1,
                propertyName: 'Image orientation',
                setter: (value) => (this.imageData.imageOrientation = Math.floor(value as number)),
                formControl: new FormControl(this.imageData.imageOrientation, [
                    ImageDataValidators.min(1),
                    ImageDataValidators.max(8),
                ]),
            },
            {
                inputType: 'number',
                propertyName: 'Latitude',
                unit: 'Decimal degrees',
                step: 0.00001,
                setter: (value) => this.setLat(value),
                formControl: new FormControl(this.extractLat(), [
                    ImageDataValidators.min(-90.0),
                    ImageDataValidators.max(90.0),
                ]),
            },
            {
                inputType: 'number',
                propertyName: 'Longitude',
                unit: 'Decimal degrees',
                step: 0.00001,
                setter: (value) => this.setLong(value),
                formControl: new FormControl(this.extractLong(), [
                    ImageDataValidators.min(-180.0),
                    ImageDataValidators.max(180.0),
                ]),
            },
        ];
    }

    private static extractDateForInput(date: Date | null): string {
        return date && !isNaN(date.getTime()) ? dayjs(date).format('YYYY-MM-DDThh:mm:ss') : '';
    }

    private extractLat(): string | null {
        return this.imageData.gps
            ? this.coordinatesService.calculateCoordinates(this.imageData.gps).lat.toFixed(5)
            : null;
    }

    private extractLong(): string | null {
        return this.imageData.gps
            ? this.coordinatesService.calculateCoordinates(this.imageData.gps).lng.toFixed(5)
            : null;
    }

    //TODO Change calculateExif GPS functions to return IExifElements
    private setLong(value: string | number | Date | null) {
        const gps = this.imageData.exifData?.GPS;
        if (gps) {
            this.coordinatesService.calculateExifGPSLongitude(gps, {
                lng: Number(value),
                lat: 0,
            });
        }
    }

    private setLat(value: string | number | Date | null) {
        const gps = this.imageData.exifData?.GPS;
        if (gps) {
            this.coordinatesService.calculateExifGPSLatitude(gps, {
                lng: 0,
                lat: Number(value),
            });
        }
    }
}
