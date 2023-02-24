﻿// <auto-generated />
using System;
using GDi.WinterAcademy.Zadatak.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace GDi.WinterAcademy.Zadatak.Infrastructure.Migrations
{
    [DbContext(typeof(WinterAcademyZadatakDbContext))]
    [Migration("20230207104214_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("GDi.WinterAcademy.Zadatak.Core.Entities.Notification", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<long>("Id"));

                    b.Property<DateTime>("DateTimeReceived")
                        .HasColumnType("datetime2");

                    b.Property<long>("SensorId")
                        .HasColumnType("bigint");

                    b.Property<float>("Status")
                        .HasColumnType("real");

                    b.HasKey("Id");

                    b.HasIndex("SensorId");

                    b.ToTable("Notifications");
                });

            modelBuilder.Entity("GDi.WinterAcademy.Zadatak.Core.Entities.Sensor", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<long>("Id"));

                    b.Property<float>("CurrentStatus")
                        .HasColumnType("real");

                    b.Property<long>("TypeId")
                        .HasColumnType("bigint");

                    b.HasKey("Id");

                    b.HasIndex("TypeId");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("GDi.WinterAcademy.Zadatak.Core.Entities.SensorType", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<long>("Id"));

                    b.Property<int>("Description")
                        .HasColumnType("int");

                    b.Property<float>("HighestValueExpected")
                        .HasColumnType("real");

                    b.Property<float>("LowestValueExpected")
                        .HasColumnType("real");

                    b.HasKey("Id");

                    b.ToTable("SensorTypes");
                });

            modelBuilder.Entity("GDi.WinterAcademy.Zadatak.Core.Entities.Notification", b =>
                {
                    b.HasOne("GDi.WinterAcademy.Zadatak.Core.Entities.Sensor", "Sensor")
                        .WithMany("Notifications")
                        .HasForeignKey("SensorId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Sensor");
                });

            modelBuilder.Entity("GDi.WinterAcademy.Zadatak.Core.Entities.Sensor", b =>
                {
                    b.HasOne("GDi.WinterAcademy.Zadatak.Core.Entities.SensorType", "Type")
                        .WithMany("Sensors")
                        .HasForeignKey("TypeId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Type");
                });

            modelBuilder.Entity("GDi.WinterAcademy.Zadatak.Core.Entities.Sensor", b =>
                {
                    b.Navigation("Notifications");
                });

            modelBuilder.Entity("GDi.WinterAcademy.Zadatak.Core.Entities.SensorType", b =>
                {
                    b.Navigation("Sensors");
                });
#pragma warning restore 612, 618
        }
    }
}