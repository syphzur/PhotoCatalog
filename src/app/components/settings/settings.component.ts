import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Settings } from 'src/app/model/Settings';
import { SettingsService } from 'src/app/service/settings.service';
import { MatDialogRef } from '@angular/material/dialog';
import isValidPath from 'is-valid-path';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
    private defaultDirSub = Subscription.EMPTY;

    settings: Settings;
    invalid = false;

    constructor(
        private settingsService: SettingsService,
        private dialogRef: MatDialogRef<SettingsComponent>,
        private ngZone: NgZone,
    ) {
        this.settings = { ...this.settingsService.settings.value }; // shallow copy
    }

    ngOnInit(): void {
        this.defaultDirSub = this.settingsService.defaultDirSelection.subscribe({
            next: (dir) => this.ngZone.run(() => (this.settings.defaultDir = dir)),
        });
    }

    close(): void {
        this.dialogRef.close();
    }

    saveAndClose(): void {
        if (!!this.settings.defaultDir && !isValidPath(this.settings.defaultDir)) {
            this.invalid = true;
            return;
        }
        this.invalid = false;
        this.settingsService.save(this.settings);
        this.close();
    }

    restoreAndClose(): void {
        this.darkModeChange(this.settingsService.settings.value.darkMode);
        this.close();
    }

    darkModeChange(darkMode: boolean): void {
        this.settingsService.setDarkMode(darkMode);
    }

    selectDefaultDir(): void {
        this.settingsService.selectDefaultDir();
    }

    ngOnDestroy(): void {
        this.defaultDirSub.unsubscribe();
    }
}
