import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { BehaviorSubject, Subject } from 'rxjs';
import { ImageData } from 'src/app/model/ImageData';
import { plainToClass } from 'class-transformer';
import IpcEvents from '../../../electron/src/communication/ipc-events';
import { ExifModificationResult } from '../model/ExifModificationResult';

@Injectable({
    providedIn: 'root',
})
export class ImageService {
    imagesNumber = new BehaviorSubject<number>(0);
    imagesData = new BehaviorSubject<ImageData[]>([]);
    modificationResponse = new Subject<ExifModificationResult | null>();

    constructor(private electronService: ElectronService) {
        this.electronService.ipcRenderer?.on(IpcEvents.ToRendered.IMG_FOUND, (_ev, data: ImageData[]) => {
            this.imagesData.next(plainToClass(ImageData, data));
        });
        this.electronService.ipcRenderer?.on(
            IpcEvents.ToRendered.MODIFY_EXIF_RESULT,
            (ev, data: ExifModificationResult) => {
                this.modificationResponse.next(data);
            },
        );
    }

    getImages(dir: string): void {
        this.electronService.ipcRenderer?.send(IpcEvents.ToMain.GET_IMG, dir);
    }

    saveNewExifValue(imageData: ImageData): void {
        this.electronService.ipcRenderer.send(IpcEvents.ToMain.MODIFY_EXIF, imageData);
    }
}
