using System.Collections.Generic;
using System.IO;
using System.Threading;
using MatchMaking.API.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace MatchMaking.API.Data
{
    public class Seed
    {
        private readonly DataContext context;
        public Seed(DataContext context)
        {
            this.context = context;
        }

        public void SeedUsers()
        {
            var userData = System.IO.File.ReadAllText("Data/UserSeedData.json");

            var users = JsonConvert.DeserializeObject<List<User>>(userData);

            var userMlData = System.IO.File.ReadAllText("Data/UserSeedMlData.json");

            JObject rss = JObject.Parse(userMlData);

            int index = 1;

            foreach (var user in users)
            {
                user.Bios = (string)rss["Bios"]["" + index + ""];
                user.Movies = (string)rss["Movies"]["" + index + ""];
                user.TV = (string)rss["TV"]["" + index + ""];
                user.Religion = (string)rss["Religion"]["" + index + ""];
                user.Music = (string)rss["Music"]["" + index + ""];
                user.Sports = (string)rss["Sports"]["" + index + ""];
                user.Books = (string)rss["Books"]["" + index + ""];
                user.Politics = (string)rss["Politics"]["" + index + ""];

                byte[] passwordHash, passwordSalt;
                createPasswordHash("password", out passwordHash, out passwordSalt);

                user.PasswordHash = passwordHash;
                user.PasswordSalt = passwordSalt;
                user.Username = user.Username.ToLower();

                context.Users.Add(user);

                index++;
                context.SaveChanges();
                Thread.Sleep(10);

            }


        }

        private void createPasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new System.Security.Cryptography.HMACSHA512())
            {
                passwordHash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(password));
                passwordSalt = hmac.Key;
            }
        }
    }
}