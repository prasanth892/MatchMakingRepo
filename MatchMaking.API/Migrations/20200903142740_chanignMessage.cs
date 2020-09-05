using Microsoft.EntityFrameworkCore.Migrations;

namespace MatchMaking.API.Migrations
{
    public partial class chanignMessage : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // migrationBuilder.DropForeignKey(
            //     name: "FK_Messages_Users_ReciepientId",
            //     table: "Messages");

            // migrationBuilder.DropIndex(
            //     name: "IX_Messages_ReciepientId",
            //     table: "Messages");

            // migrationBuilder.DropColumn(
            //     name: "ReciepientId",
            //     table: "Messages");

            // migrationBuilder.AddColumn<int>(
            //     name: "RecipientId",
            //     table: "Messages",
            //     nullable: false,
            //     defaultValue: 0);

            // migrationBuilder.CreateIndex(
            //     name: "IX_Messages_RecipientId",
            //     table: "Messages",
            //     column: "RecipientId");

            // migrationBuilder.AddForeignKey(
            //     name: "FK_Messages_Users_RecipientId",
            //     table: "Messages",
            //     column: "RecipientId",
            //     principalTable: "Users",
            //     principalColumn: "Id",
            //     onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Users_RecipientId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_RecipientId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "RecipientId",
                table: "Messages");

            migrationBuilder.AddColumn<int>(
                name: "ReciepientId",
                table: "Messages",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ReciepientId",
                table: "Messages",
                column: "ReciepientId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Users_ReciepientId",
                table: "Messages",
                column: "ReciepientId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
