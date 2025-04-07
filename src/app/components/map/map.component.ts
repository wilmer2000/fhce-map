import { AfterViewInit, Component, inject, OnDestroy, OnInit } from '@angular/core';
import * as geojson from 'geojson';
import * as L from 'leaflet';
import { GeoJSON, LatLng, Layer, LeafletMouseEvent, Map, Point } from 'leaflet';
import { Subscription } from 'rxjs';

import { EMapType, IGeoJson, IMapState } from '../../interfaces/building.interface';
import { BuildingService } from '../../services/building.service';
import { KeyValuePipe, NgOptimizedImage, NgStyle } from '@angular/common';
import { MapTypePipe } from '../../pipes/map-type.pipe';
import { IModal, ModalService } from '../../services/modal.service';
import { MAP_COLOR, MAP_CONTAINER_ID, MAP_MVD_CENTER, MAP_ZOOM } from '../../constants/map.constant';

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  imports: [KeyValuePipe, MapTypePipe, NgOptimizedImage, NgStyle]
})
export class MapComponent implements AfterViewInit, OnInit, OnDestroy {
  mapState: IMapState;
  readonly mapTypes = EMapType;
  protected readonly mapContainerId = MAP_CONTAINER_ID;
  protected readonly mapColors = MAP_COLOR;

  private map: Map;
  private readonly buildingService = inject(BuildingService);
  private readonly modalService = inject(ModalService);
  private subscriptions: Subscription[] = [];
  private featureGroup: GeoJSON;

  ngOnInit(): void {
    this.subscriptions.push(
      this.buildingService.buildings$.subscribe((buildings: IGeoJson) => {
        if (this.map) this.loadMarks(buildings);
      })
    );
    this.subscriptions.push(
      this.buildingService.stateMap$.subscribe((mapState: IMapState) => {
        if (mapState) this.mapState = mapState;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription: Subscription) => subscription.unsubscribe());
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  onYearChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const selectedYear = inputElement.value;
    const filter = { ...this.mapState, yearSelected: +selectedYear };
    this.buildingService.setMapState(filter);
    this.buildingService.getBuildings();
  }

  private initMap(): void {
    this.map = L.map(MAP_CONTAINER_ID, {
      center: MAP_MVD_CENTER, // Montevideo City
      zoom: MAP_ZOOM
    });

    const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 18,
      minZoom: 3
    });

    tiles.addTo(this.map);
  }

  private loadMarks(buildings: IGeoJson): void {
    if (this.featureGroup) {
      this.featureGroup.clearLayers();
    }

    this.featureGroup = L.geoJSON(buildings, {
      pointToLayer(geoJsonPoint: geojson.Feature<geojson.Point, any>, latlng: LatLng): Layer {
        return new L.CircleMarker(latlng, {
          radius: 5,
          fillOpacity: 1,
          color: geoJsonPoint.properties.mapIconColor
        });
      }
    }).bindTooltip((layer: any) => {
      return layer.feature.properties.name;
    }, {
      direction: 'top',
      offset: new Point(0, -10),
      opacity: 1,
      className: 'tooltip'
    });

    this.featureGroup
      .on('click', (buildSelected: LeafletMouseEvent) => {
        if (!buildSelected) {
          return;
        }
        const build: any = buildSelected.layer?.feature.properties;
        this.openModal(build);
      })
      .addTo(this.map);
  }

  private openModal(build: any): void {
    const modal: IModal = ModalService.buildModalContent(build);
    this.modalService.openModal(modal);
  }
}
