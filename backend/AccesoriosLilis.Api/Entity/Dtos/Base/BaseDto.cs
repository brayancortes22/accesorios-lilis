namespace AccesoriosLilis.Api.Entity.Dtos.Base;

public abstract class BaseDto
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
}
