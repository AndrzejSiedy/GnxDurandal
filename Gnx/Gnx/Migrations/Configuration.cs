namespace Gnx.Migrations
{
    using Gnx.Models;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Web.Helpers;

    internal sealed class Configuration : DbMigrationsConfiguration<Gnx.Models.ApplicationDbContext>
    {
        public Configuration()
        {
            AutomaticMigrationsEnabled = false;
        }

        protected override void Seed(Gnx.Models.ApplicationDbContext context)
        {

            // create set of roles
            context.Roles.AddOrUpdate(p => p.Name, new IdentityRole { Name = "administrator" });
            context.Roles.AddOrUpdate(p => p.Name, new IdentityRole { Name = "superuser" });
            context.Roles.AddOrUpdate(p => p.Name, new IdentityRole { Name = "authenticated" });
            context.Roles.AddOrUpdate(p => p.Name, new IdentityRole { Name = "guest" });

            // commit changes
            context.SaveChanges();

            // create admin user
            var admin = new ApplicationUser
            {
                UserName = "admin",
                Email = "admin@geonetix.pl",
                PasswordHash = Crypto.HashPassword("test111")
            };
            context.Users.AddOrUpdate(admin);
            // commit changes
            context.SaveChanges();

            // get created admin user
            var myUser = context.Users.Single(user => user.Email == admin.Email);

            // get created admi  role
            var adminRole = context.Roles.Single(role => role.Name == "administrator");

            // assign admin role to admin user
            admin.Roles.Add(new IdentityUserRole() { 
                RoleId = adminRole.Id,
                UserId = myUser.Id
            });

            // commit changes
            context.SaveChanges();


            //  This method will be called after migrating to the latest version.

            //  You can use the DbSet<T>.AddOrUpdate() helper extension method 
            //  to avoid creating duplicate seed data. E.g.
            //
            //    context.People.AddOrUpdate(
            //      p => p.FullName,
            //      new Person { FullName = "Andrew Peters" },
            //      new Person { FullName = "Brice Lambson" },
            //      new Person { FullName = "Rowan Miller" }
            //    );
            //
        }
    }
}
