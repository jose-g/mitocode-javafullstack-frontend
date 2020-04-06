import { Component, OnInit, ViewChild } from '@angular/core';
import { Signos } from 'src/app/_model/signos';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { SignosService } from 'src/app/_service/Signos.Service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signos',
  templateUrl: './signos.component.html',
  styleUrls: ['./signos.component.css']
})
export class SignosComponent implements OnInit {

  cantidad: number = 0;
  displayedColumns = ['idSignos','idPaciente', 'fecha', 'temperatura','pulso','ritmo', 'acciones'];
  dataSource: MatTableDataSource<Signos>
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


  constructor(
    private signosService: SignosService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(){
    this.signosService.mensajeCambio.subscribe(data => {
      this.snackBar.open(data, 'AVISO', {
        duration: 2000
      });
    });

    this.signosService.signosCambio.subscribe(data => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });

    this.signosService.listarPageable(0, 10).subscribe(data => {
      console.log(data);
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
      //this.dataSource.paginator = this.paginator;
    });
  }
  filtrar(valor: string) {
    this.dataSource.filter = valor.trim().toLowerCase();
  }

  eliminar(idSignos: number) {
    this.signosService.eliminar(idSignos).subscribe(() => {
      this.signosService.listar().subscribe(data => {
        this.signosService.signosCambio.next(data);
        this.signosService.mensajeCambio.next('SE ELIMINO');
      });
    });
  }

  mostrarMas(e: any) {
    this.signosService.listarPageable(e.pageIndex, e.pageSize).subscribe(data => {
      this.cantidad = data.totalElements;
      this.dataSource = new MatTableDataSource(data.content);
      this.dataSource.sort = this.sort;
    });
  }
}
